const express = require('express');
const router = express.Router();
const ordersController = require('../app/controllers/OrdersController');
const validate = require('../app/middlewares/validateMiddleware');
const Orders = require('../app/models/Orders');
const { body } = require('express-validator');

// Hàm lấy danh sách hóa đơn
const fetchOrders = async () => {
    const orders = await Orders.find({}).lean();
    return { orders };
};

router.get('/show', ordersController.show);
router.get('/create', ordersController.create);
// router.post(
//     '/store',
//     [
//         body('name').notEmpty().withMessage('Tên khách hàng không được để trống'),
//         body('phone').notEmpty().withMessage('Số điện thoại khách hàng không được để trống'),
//         body('statusPayment').notEmpty().withMessage('Tình trạng thanh toán không được để trống'),
//         body('email').notEmpty().withMessage('Email khách hàng không được để trống'),
//         body('productId').notEmpty().withMessage('Sản phẩm không được để trống'),
//         body('methodPayment').notEmpty().withMessage('Phương thức thanh toán không được để trống'),
//         validate('orders/create', fetchOrders),
//     ],
//     ordersController.store,
// );
router.post('/store', ordersController.store);
router.put('/:id/cancel', ordersController.cancelOrder);
router.delete('/:id', ordersController.hardDeleteOrder);
router.get('/detail/:slug', ordersController.detail);

module.exports = router;
