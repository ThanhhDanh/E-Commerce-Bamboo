const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const categoriesController = require('../app/controllers/CategoryController');
const validate = require('../app/middlewares/validateMiddleware');
const Category = require('../app/models/Categories');


// Hàm lấy danh sách danh mục
const fetchCategories = async () => {
    const categories = await Category.find({}).lean();
    return { categories };
};

router.get('/create', categoriesController.create);
router.post('/store', [
    body('name').notEmpty().withMessage("Tên thư mục không được để trống"),
    validate('categories/create', fetchCategories)
], categoriesController.store);

module.exports = router;