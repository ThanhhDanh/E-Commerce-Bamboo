const express = require('express');
const router = express.Router();
const categoriesController = require('../../app/controllers/CategoryController');
const meController = require('../../app/controllers/MeController');
const productsController = require('../../app/controllers/ProductController');

// API routes

//API Categories
router.get('/categories', categoriesController.index);
router.post('/categories', categoriesController.storeAPI);

// API Products
router.get('/products', meController.index);
router.get('/colors', productsController.indexColor);
router.get('/genders', productsController.indexGender);
router.get('/sizes', productsController.indexSize);

module.exports = router;
