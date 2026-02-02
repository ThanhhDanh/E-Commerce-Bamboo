const express = require('express');
const router = express.Router();
const productsController = require('../app/controllers/ProductController');
const { upload } = require('../config/cloudinary/index');
const { body } = require('express-validator');
const validate = require('../app/middlewares/validateMiddleware');
const Product = require('../app/models/Products');
const Gender = require('../app/models/Genders');
const Sizes = require('../app/models/Sizes');
const Colors = require('../app/models/Colors');

// Hàm lấy danh sách sản phẩm
const fetchProducts = async () => {
    const products = await Product.find({}).lean();
    return { products };
};

// Hàm lấy danh sách giới tính
const fetchGenders = async () => {
    const genders = await Gender.find({}).lean();
    return { genders };
};

// Hàm lấy danh sách kích thước
const fetchSizes = async () => {
    const sizes = await Sizes.find({}).lean();
    return { sizes };
};

// Hàm lấy danh sách màu sắc
const fetchColors = async () => {
    const colors = await Colors.find({}).lean();
    return { colors };
};

// newsController.index
router.get('/create', productsController.create);
router.post(
    '/store',
    upload.any(),
    [
        body('name').notEmpty().withMessage('Tên sản phẩm không được để trống'),
        body('description').notEmpty().withMessage('Thông tin sản phẩm không được để trống'),
        body('price').notEmpty().withMessage('Giá sản phẩm không được để trống'),
        body('genderId').notEmpty().withMessage('Giới tính sản phẩm không được để trống'),
        body('userId').notEmpty().withMessage('Chủ sản phẩm không được để trống'),
        body('categoryId').notEmpty().withMessage('Loại sản phẩm không được để trống'),
        body('shopId').notEmpty().withMessage('Cửa hàng cho sản phẩm không được để trống'),
        validate('products/create', fetchProducts),
    ],
    productsController.store,
);
router.post('/handle-form-actions', productsController.handleFormActions);
router.put('/:id', upload.any(), productsController.update);
router.delete('/:id', productsController.delete);
router.delete('/:id/force', productsController.deleteForce);
router.patch('/:id/restore', productsController.restore);
router.get('/:id/edit', productsController.edit);
router.get('/gender/create', productsController.genderCreate);
router.post(
    '/gender/store',
    [
        body('name').notEmpty().withMessage('Tên giới tính không được để trống'),
        validate('products/genderCreate', fetchGenders),
    ],
    productsController.genderStore,
);
router.delete('/gender/:id/force', productsController.deleteGenderForce);
router.get('/:slug', productsController.show);

router.get('/size/create', productsController.sizeCreate);
router.post(
    '/size/store',
    [
        body('name').notEmpty().withMessage('Tên giới tính không được để trống'),
        validate('products/sizeCreate', fetchSizes),
    ],
    productsController.sizeStore,
);
router.delete('/size/:id/force', productsController.deleteSizeForce);
router.get('/color/create', productsController.colorCreate);
router.post(
    '/color/store',
    [
        body('name').notEmpty().withMessage('Tên màu sắc không được để trống'),
        validate('products/colorCreate', fetchColors),
    ],
    productsController.colorStore,
);
router.delete('/color/:id/force', productsController.deleteColorForce);

module.exports = router;
