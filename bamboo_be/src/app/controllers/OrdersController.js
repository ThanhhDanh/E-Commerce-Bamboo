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
const https = require('https');
const { tryCatch } = require('bullmq');

class OrdersController {
    //API
    //[POST] /payment/momo
    async methodMomoPayment(req, res, next) {
        try {
            const { userId, orderInfo, amount, methodPayment, discountId, signatureName, orderDetails = [] } = req.body;

            const partnerCode = 'MOMO';
            const accessKey = 'F8BBA842ECF85';
            const secretkey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';

            const requestId = partnerCode + new Date().getTime();
            const redirectUrl = 'http://localhost:5173/payment/momo-return'; // FE redirect
            const ipnUrl = 'https://e-commerce-bamboo.onrender.com/api/payment/momo-ipn'; // BE callback
            const requestType = 'captureWallet';

            const encryptedSignature = encrypt(signatureName);

            //Tạo Order trước để lấy id
            const order = await Orders.create({
                userId,
                description: orderInfo,
                discountId,
                methodPayment: methodPayment,
                statusPayment: 'Pending',
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

            // raw signature
            const rawSignature =
                'accessKey=' +
                accessKey +
                '&amount=' +
                amount +
                '&extraData=' +
                extraData +
                '&ipnUrl=' +
                ipnUrl +
                '&orderId=' +
                orderId +
                '&orderInfo=' +
                orderInfo +
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

            const requestBody = JSON.stringify({
                partnerCode,
                accessKey,
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                extraData,
                requestType,
                signature,
                lang: 'en',
            });

            const options = {
                hostname: 'test-payment.momo.vn',
                port: 443,
                path: '/v2/gateway/api/create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody),
                },
            };

            const momoReq = https.request(options, (momoRes) => {
                let data = '';
                momoRes.on('data', (chunk) => {
                    data += chunk;
                });
                momoRes.on('end', () => {
                    const result = JSON.parse(data);
                    return res.json(result); // trả về cho FE
                });
            });

            momoReq.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
                return res.status(500).json({ success: false, message: e.message });
            });

            momoReq.write(requestBody);
            momoReq.end();
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
                    statusPayment: 'Paid',
                    totalAmount: amount,
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
            const { name, statusPayment, description, discountId, signature, orderDetails = [] } = req.body;

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
                signature: encryptedSignature,
                totalAmount,
            });

            const savedOrder = await order.save();

            // Tạo chi tiết đơn hàng
            const mappedDetails = orderDetails.map((detail) => ({
                quantity: Number(detail.quantity),
                unitPrice: Number(detail.unitPrice),
                statusPayment: detail.statusPayment,
                methodPayment: detail.methodPayment,
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

            //Lấy tất cả hóa đơn của người dùng
            const userOrders = await Orders.find({ userId: order.userId }).sort({ createdAt: -1 }).populate('userId');

            res.render('orders/detail', {
                order: mongodbToObject(order),
                signature,
                currentDate: moment(date).locale('vi').format('ll'),
                orderItems: mutipleMongooseToObject(orderItems),
                userOrders: mutipleMongooseToObject(userOrders),
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrdersController();
