const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const shopsController = require('../app/controllers/ShopController');
const validate = require('../app/middlewares/validateMiddleware');
const { upload } = require('../config/cloudinary/index');
const Shop = require('../app/models/Shops');

// Hàm lấy danh sách giới tính
const fetchShops = async () => {
    const shops = await Shop.find({}).lean();
    return { shops };
};


router.get('/create', shopsController.create);
router.post('/store', upload.single('image'), [
    body('name').notEmpty().withMessage("Tên cửa hàng không được để trống"),
    body('address').notEmpty().withMessage("Địa chỉ cửa hàng không được để trống"),
    body('ownerId').notEmpty().withMessage("Chủ hàng không được để trống"),
    body('categoryId').notEmpty().withMessage("Loại cửa hàng không được để trống"),
    validate('shops/create', fetchShops)
], shopsController.store);
router.post('/handle-form-actions', shopsController.handleFormActions);
router.put('/:id', upload.single('image'), shopsController.update);
router.delete('/:id', shopsController.delete);
router.delete('/:id/force', shopsController.deleteForce);
router.patch('/:id/restore', shopsController.restore);
router.get('/:id/edit', shopsController.edit);

module.exports = router;