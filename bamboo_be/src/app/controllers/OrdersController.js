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

class OrdersController {
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

            return res.json({ success: true, redirectUrl: '/orders/show' });
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
