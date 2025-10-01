const { mongodbToObject, mutipleMongooseToObject } = require('../../util/mongoose');
const OrderDetails = require('../models/OrderDetails');
const Orders = require('../models/Orders');
const Products = require('../models/Products');
const Discounts = require('../models/Discounts');
const Sizes = require('../models/Sizes');
const Colors = require('../models/Colors');
const decrypt = require('../../util/decrypt');
const Users = require('../models/Users');
const encrypt = require('../../util/encrypt');
const moment = require('moment');
const crypto = require('crypto');
const axios = require('axios');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

class OrdersController {
    //API

    //[POST] /payment/vnpay
    async methodVnpayPayment(req, res, next) {
        try {
            const { userId, orderInfo, methodPayment, discountId, signatureName, orderDetails = [] } = req.body;

            // Tính tổng tiền
            let totalAmount = orderDetails.reduce((sum, item) => {
                const itemTotal = item.unitPrice * item.quantity;
                const tax = item.tax ? itemTotal * item.tax : 0;
                return sum + itemTotal + tax;
            }, 0);

            if (discountId) {
                const discount = await Discounts.findById(discountId);
                if (discount) {
                    const discountPercent = Number(discount.price) || 0;
                    totalAmount = totalAmount * (1 - discountPercent / 100);
                }
            }

            const amount = Math.round(totalAmount);

            const encryptedSignature = encrypt(signatureName);

            // Tạo Order trong DB
            const order = await Orders.create({
                userId,
                description: orderInfo,
                discountId,
                status: 'Pending',
                methodPayment,
                totalAmount: amount,
                signature: encryptedSignature,
            });

            const details = orderDetails.map((p) => ({
                orderId: order._id,
                productId: p.productId,
                discountId,
                quantity: p.quantity,
                unitPrice: p.unitPrice,
                tax: p.tax,
                statusPayment: 'Pending',
                methodPayment,
                sizeIds: p.sizeIds || [],
                colorIds: p.colorIds || [],
            }));
            await OrderDetails.insertMany(details);

            // Dùng SDK VNPay
            const vnpay = new VNPay({
                tmnCode: 'B2BXHDSS',
                secureSecret: 'M4HTSPIK5EI9CCYDMTCLY7YLGO0UTXI2',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true,
                hashAlgorithm: 'SHA512',
                enableLog: true,
            });

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const txnRef = `${order._id}-${Date.now()}`;

            const vnpayUrl = vnpay.buildPaymentUrl({
                vnp_Amount: amount,
                vnp_IpAddr: req.ip || '127.0.0.1',
                vnp_TxnRef: txnRef,
                vnp_OrderInfo: orderInfo || `Thanh toán đơn hàng #${order._id}`,
                vnp_OrderType: 'other',
                vnp_ReturnUrl: 'https://d3f698557309.ngrok-free.app/api/payment/vnpay-return',
                vnp_Locale: 'vn',
                vnp_CreateDate: dateFormat(new Date()),
                vnp_ExpireDate: dateFormat(tomorrow),
            });

            return res.json({ success: true, payUrl: vnpayUrl });
        } catch (err) {
            console.error('VNPay error:', err);
            return res.status(500).json({ success: false, message: 'Lỗi tạo thanh toán VNPay' });
        }
    }

    //[GET] /api/payment/vnpay-return
    async checkPaymentVNPay(req, res, next) {
        try {
            const vnpay = new VNPay({
                tmnCode: 'B2BXHDSS',
                secureSecret: 'M4HTSPIK5EI9CCYDMTCLY7YLGO0UTXI2',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true,
                hashAlgorithm: 'SHA512',
            });

            const isValid = vnpay.verifyReturnUrl(req.query);
            if (!isValid) {
                if (req.xhr || req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ success: false, message: 'Sai chữ ký VNPay' });
                }
                return res.redirect('/orders/show?error=' + encodeURIComponent('Sai chữ ký VNPay'));
            }

            const txnRef = req.query.vnp_TxnRef;
            const orderId = txnRef.split('-')[0];
            const rspCode = req.query.vnp_ResponseCode;

            console.log(txnRef, orderId, rspCode);

            if (rspCode === '00') {
                await Orders.findByIdAndUpdate(orderId, { status: 'Paid' });
                await OrderDetails.updateMany({ orderId }, { statusPayment: 'Paid' });

                if (req.xhr || req.headers.accept.includes('application/json')) {
                    return res.json({ success: true, message: 'Thanh toán VNPay thành công' });
                }
                return res.redirect('/orders/show?success=' + encodeURIComponent('Thanh toán VNPay thành công'));
            } else {
                await Orders.findByIdAndUpdate(orderId, { status: 'Failed' });
                await OrderDetails.updateMany({ orderId }, { statusPayment: 'Failed' });

                if (req.xhr || req.headers.accept.includes('application/json')) {
                    return res.json({ success: false, message: 'Thanh toán VNPay thất bại' });
                }
                return res.redirect('/orders/show?error=' + encodeURIComponent('Thanh toán VNPay thất bại'));
            }
        } catch (err) {
            console.error('VNPay return error:', err);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({ success: false, message: 'Lỗi xử lý VNPay return' });
            }
            return res.redirect('/orders/show?error=' + encodeURIComponent('Lỗi xử lý VNPay return'));
        }
    }

    //[POST] /payment/momo
    async methodMomoPayment(req, res, next) {
        try {
            const { userId, orderInfo, methodPayment, discountId, signatureName, orderDetails = [] } = req.body;

            const partnerCode = 'MOMO';
            const accessKey = 'F8BBA842ECF85';
            const secretkey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';

            const requestId = partnerCode + new Date().getTime();
            const redirectUrl = 'https://e-commerce-bamboo.vercel.app/payment/momo-return'; // FE redirect
            const ipnUrl = 'https://e-commerce-bamboo.onrender.com/api/payment/momo-ipn'; // BE callback
            const requestType = 'captureWallet';

            let totalAmount = orderDetails.reduce((sum, item) => {
                const itemTotal = item.unitPrice * item.quantity;
                const tax = item.tax ? itemTotal * item.tax : 0;
                return sum + itemTotal + tax;
            }, 0);

            if (discountId) {
                const discount = await Discounts.findById(discountId);
                if (discount) {
                    const discountPercent = Number(discount.price) || 0;
                    totalAmount = totalAmount * (1 - discountPercent / 100);
                }
            }

            const amount = Math.round(totalAmount);

            const encryptedSignature = encrypt(signatureName);

            //Tạo Order trước để lấy id
            const order = await Orders.create({
                userId,
                description: orderInfo,
                discountId,
                status: 'Pending',
                methodPayment,
                totalAmount: amount,
                signature: encryptedSignature,
            });

            const details = orderDetails.map((p) => ({
                orderId: order._id,
                productId: p.productId,
                discountId,
                quantity: p.quantity,
                unitPrice: p.unitPrice,
                tax: p.tax,
                statusPayment: 'Pending',
                methodPayment,
                sizeIds: p.sizeIds || [],
                colorIds: p.colorIds || [],
            }));
            await OrderDetails.insertMany(details);

            const orderId = order._id.toString();
            const extraData = JSON.stringify({
                userId,
                orderId,
            });

            const rawOrderId = order._id.toString();
            const momoOrderId = `MOMO_${rawOrderId}_${Date.now()}`;
            const amountStr = String(amount);
            const orderInfoStr = orderInfo || `Thanh toán đơn hàng #${rawOrderId}`;

            // raw signature
            const rawSignature =
                'accessKey=' +
                accessKey +
                '&amount=' +
                amountStr +
                '&extraData=' +
                extraData +
                '&ipnUrl=' +
                ipnUrl +
                '&orderId=' +
                momoOrderId +
                '&orderInfo=' +
                orderInfoStr +
                '&partnerCode=' +
                partnerCode +
                '&redirectUrl=' +
                redirectUrl +
                '&requestId=' +
                requestId +
                '&requestType=' +
                requestType;

            // ký HMAC SHA256
            const signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

            const requestBody = {
                partnerCode,
                accessKey,
                requestId,
                amount: amountStr,
                orderId: momoOrderId,
                orderInfo: orderInfoStr,
                redirectUrl,
                ipnUrl,
                extraData,
                requestType,
                signature,
                lang: 'vi',
            };

            console.log(requestBody);

            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return res.status(200).json({
                success: true,
                payUrl: response.data.payUrl,
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Lỗi tạo thanh toán MoMo' });
        }
    }

    async momoIpn(req, res, next) {
        try {
            console.log('IPN từ MoMo: ', req.body);

            const { resultCode, amount, extraData } = req.body;
            const parsed = extraData ? JSON.parse(extraData) : {};
            const { orderId } = parsed;

            if (!orderId) {
                return res.status(400).json({ message: 'Thiếu orderId' });
            }

            if (resultCode === 0) {
                // Thanh toán thành công → update Order + OrderDetails
                await Orders.findByIdAndUpdate(orderId, {
                    status: 'Paid',
                    totalAmount: amount,
                    transId: req.body.transId,
                });

                await OrderDetails.updateMany({ orderId }, { statusPayment: 'Paid' });

                return res.json({ message: 'Thanh toán MoMo thành công' });
            }

            // Thanh toán thất bại → update Order + OrderDetails
            await Orders.findByIdAndUpdate(orderId, { statusPayment: 'Failed' });
            await OrderDetails.updateMany({ orderId }, { statusPayment: 'Failed' });

            return res.status(400).json({ message: 'Thanh toán MoMo thất bại' });
        } catch (err) {
            console.error('Error in MoMo IPN:', err);
            return res.status(500).json({ message: 'Backend lỗi' });
        }
    }

    // [PUT] /payment/momo/:id/cancel
    async cancelMomoPayment(req, res) {
        try {
            const { id } = req.params;
            const order = await Orders.findById(id);
            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }

            // Nếu order chưa thanh toán
            if (order.statusPayment === 'Pending') {
                order.statusPayment = 'Cancel';
                await order.save();
                await OrderDetails.updateMany({ orderId: id }, { statusPayment: 'Cancel' });
                return res.json({ success: true, message: 'Đã hủy đơn hàng (MoMo Pending)' });
            }

            // Nếu order đã thanh toán thành công
            if (order.statusPayment === 'Paid') {
                // --- Gọi MoMo Refund API ---
                const partnerCode = 'MOMO';
                const accessKey = 'F8BBA842ECF85';
                const secretkey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';

                const requestId = partnerCode + new Date().getTime();
                const refundOrderId = `REFUND_${order._id}_${Date.now()}`;
                const transId = order.transId; // Lưu transId từ IPN trước đó

                const amount = String(order.totalAmount);

                const rawSignature =
                    `accessKey=${accessKey}&amount=${amount}&description=Hoan tien don hang ${order._id}` +
                    `&orderId=${refundOrderId}&partnerCode=${partnerCode}&requestId=${requestId}&transId=${transId}`;

                const signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

                const requestBody = {
                    partnerCode,
                    orderId: refundOrderId,
                    requestId,
                    amount,
                    transId,
                    lang: 'vi',
                    description: `Hoàn tiền đơn hàng #${order._id}`,
                    signature,
                    accessKey,
                };

                const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/refund', requestBody, {
                    headers: { 'Content-Type': 'application/json' },
                });

                console.log('Refund response:', response.data);

                if (response.data.resultCode === 0) {
                    order.statusPayment = 'Refunded';
                    await order.save();
                    await OrderDetails.updateMany({ orderId: id }, { statusPayment: 'Refunded' });
                    return res.json({ success: true, message: 'Hoàn tiền MoMo thành công' });
                } else {
                    return res
                        .status(400)
                        .json({ success: false, message: 'Hoàn tiền MoMo thất bại', momo: response.data });
                }
            }

            // Nếu đã Cancel hoặc Failed thì không cho hủy nữa
            return res.status(400).json({ message: 'Đơn hàng không thể hủy' });
        } catch (err) {
            console.error('Cancel MoMo error:', err);
            return res.status(500).json({ message: 'Server lỗi khi hủy MoMo' });
        }
    }

    // ================================================================================================

    // [GET] /orders/show
    show(req, res, next) {
        Orders.find({})
            .populate('userId')
            .then((orders) => {
                const ordersSended = orders.length;
                const ordersPaid = orders.filter((order) => order.status === 'Paid').length;
                const ordersCancel = orders.filter((order) => order.status === 'Cancel').length;
                const totalSendedRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
                const totalPaidRevenue = orders
                    .filter((order) => order.status === 'Paid')
                    .reduce((sum, order) => sum + order.totalAmount, 0);
                const totalCancelRevenue = orders
                    .filter((order) => order.status === 'Cancel')
                    .reduce((sum, order) => sum + order.totalAmount, 0);

                const keyword = req.query.name?.toLowerCase() || '';
                const filteredOrders = orders.filter(
                    (order) => order.userId && order.userId.firstName.toLowerCase().includes(keyword),
                );
                res.render('orders/show', {
                    orders: mutipleMongooseToObject(filteredOrders),
                    ordersSended,
                    ordersPaid,
                    ordersCancel,
                    totalSendedRevenue,
                    totalPaidRevenue,
                    totalCancelRevenue,
                });
            })
            .catch(next);
    }

    // [GET] /orders/create
    create(req, res, next) {
        Promise.all([
            Products.find({}),
            Discounts.find({}),
            Sizes.find({}),
            Colors.find({}),
            Users.find({ role: 'user' }),
        ])
            .then(([products, discounts, sizes, colors, users]) => {
                const colorMap = {};
                colors.forEach((color) => (colorMap[color._id] = color.name));

                const sizeMap = {};
                sizes.forEach((size) => (sizeMap[size._id] = size.name));

                // Gắn colors[] và sizes[] vào từng sản phẩm
                const productData = products.map((product) => {
                    const productObj = product.toObject();
                    return {
                        ...productObj,
                        colors: (productObj.colorIds || []).map((id) => ({
                            id,
                            name: colorMap[id],
                        })),
                        sizes: (productObj.sizeIds || []).map((id) => ({
                            id,
                            name: sizeMap[id],
                        })),
                    };
                });

                res.render('orders/create', {
                    products: productData,
                    discounts: mutipleMongooseToObject(discounts),
                    users: mutipleMongooseToObject(users),
                });
            })
            .catch(next);
    }

    // [POST] /orders/store
    async store(req, res, next) {
        try {
            const {
                name,
                statusPayment,
                methodPayment,
                description,
                discountId,
                signature,
                orderDetails = [],
            } = req.body;

            if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
                return res.status(400).json({ message: 'Order details are required' });
            }

            // Tính tổng tiền có thuế (1%)
            let totalAmount = orderDetails.reduce((total, detail) => {
                const quantity = parseInt(detail.quantity) || 0;
                const price = parseFloat(detail.unitPrice) || 0;
                const tax = 0.01;
                return total + quantity * price * (1 + tax);
            }, 0);

            if (discountId) {
                const discount = await Discounts.findById(discountId);
                if (discount && discount.price) {
                    totalAmount -= discount.price;
                }
            }

            //Kiểm tra không = âm
            totalAmount = Math.max(0, totalAmount);

            const encryptedSignature = encrypt(signature);

            // Tạo đơn hàng
            const order = new Orders({
                userId: Number(name),
                description,
                discountId,
                status: statusPayment,
                methodPayment: methodPayment,
                signature: encryptedSignature,
                totalAmount,
            });

            const savedOrder = await order.save();

            // Tạo chi tiết đơn hàng
            const mappedDetails = orderDetails.map((detail) => ({
                quantity: Number(detail.quantity),
                unitPrice: Number(detail.unitPrice),
                statusPayment: statusPayment,
                methodPayment: methodPayment,
                discountId: Number(detail.discountId),
                productId: Number(detail.productId),
                orderId: savedOrder._id,
                sizeIds: detail.sizeIds.map((id) => Number(id)),
                colorIds: detail.colorIds.map((id) => Number(id)),
            }));

            await OrderDetails.insertMany(mappedDetails);

            return res.json({ success: true, order: savedOrder });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi tạo hóa đơn' });
        }
    }

    // [GET] /orders/detail/:id
    async detail(req, res, next) {
        try {
            // Lấy đơn hàng
            const order = await Orders.findOne({ slug: req.params.slug }).populate('userId');
            if (!order) return res.status(404).send('Order not found');

            let signature = '';
            if (order.signature) {
                signature = decrypt(order.signature); // Hàm giải mã của bạn
            }

            // Lấy ngày giờ hiện tại
            const date = new Date();

            // Lấy chi tiết đơn hàng
            const orderItems = await OrderDetails.find({ orderId: order._id }).populate([
                { path: 'productId' },
                { path: 'colorIds' },
                { path: 'sizeIds' },
                { path: 'discountId' },
            ]);

            const discountPercent = orderItems[0]?.discountId?.price || 0;

            const totalPrice = orderItems.reduce((sum, item) => {
                return sum + item.productId.price * item.quantity;
            }, 0);

            //Lấy tất cả hóa đơn của người dùng
            const userOrders = await Orders.find({ userId: order.userId }).sort({ createdAt: -1 }).populate('userId');

            res.render('orders/detail', {
                order: mongodbToObject(order),
                signature,
                currentDate: moment(date).locale('vi').format('L'),
                orderItems: mutipleMongooseToObject(orderItems),
                discountPercent,
                totalPrice,
                userOrders: mutipleMongooseToObject(userOrders),
            });
        } catch (error) {
            next(error);
        }
    }

    // [PUT] /orders/:id/cancel
    async cancelOrder(req, res) {
        try {
            const { id } = req.params;
            const order = await Orders.findById(id);

            if (!order) return res.redirect('/orders/show?error=' + encodeURIComponent('Không tìm thấy đơn hàng'));

            if (order.methodPayment === 'Cash') {
                if (order.status === 'Pending') {
                    order.status = 'Cancel';
                    await order.save();
                    await OrderDetails.updateMany({ orderId: id }, { statusPayment: 'Cancel' });

                    return res.redirect('/orders/show?success=' + encodeURIComponent('Đã hủy đơn (Cash)'));
                }
                return res.redirect('/orders/show?error=' + encodeURIComponent('Đơn Cash này không thể hủy'));
            }

            res.redirect('/orders/show?error=' + encodeURIComponent('Sai phương thức thanh toán'));
        } catch (err) {
            console.error(err);
            res.redirect('/orders/show?error=' + encodeURIComponent('Server lỗi'));
        }
    }

    //[DELETE] /orders.:id
    async hardDeleteOrder(req, res) {
        try {
            const { id } = req.params;

            const order = await Orders.findByIdAndDelete(id);
            await OrderDetails.deleteMany({ orderId: id });

            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng để xoá' });
            }

            return res.json({ success: true, message: 'Đã xoá đơn hàng và chi tiết liên quan' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Lỗi xoá đơn hàng' });
        }
    }
}

module.exports = new OrdersController();
