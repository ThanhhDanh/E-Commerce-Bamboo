const express = require('express');
const { body } = require('express-validator');
const validate = require('../app/middlewares/validateMiddleware');
const router = express.Router();
const discountsController = require('../app/controllers/DiscountController');
const Discount = require('../app/models/Discounts');


// Hàm lấy danh sách danh mục
const fetchDiscounts = async () => {
    const discounts = await Discount.find({}).lean();
    return { discounts };
};

router.get('/create', discountsController.create);
router.post('/store',[
    body('name').notEmpty().withMessage("Tên phiếu giảm giá không được để trống"),
    body('description').notEmpty().withMessage("Mô tả phiếu giảm giá không được để trống"),
    body('price').notEmpty().withMessage("Giá % phiếu giảm giá không được để trống"),
    body('amount').notEmpty().withMessage("Số lượng phiếu giảm giá không được để trống"),
    validate('discounts/create', fetchDiscounts)
], discountsController.store);
router.delete('/:id/force', discountsController.deleteForce);

module.exports = router;