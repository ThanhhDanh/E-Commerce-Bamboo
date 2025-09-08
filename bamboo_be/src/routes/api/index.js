const express = require('express');
const router = express.Router();
const categoriesController = require('../../app/controllers/CategoryController');
const meController = require('../../app/controllers/MeController');
const productsController = require('../../app/controllers/ProductController');
const campaignsController = require('../../app/controllers/CampaignController');
const apiAuthController = require('../../app/controllers/ApiAuthController');
const authenticateToken = require('../../app/middlewares/authenticateToken');

// API routes

//API Categories
router.get('/categories', categoriesController.index);
router.post('/categories', categoriesController.storeAPI);

// API Products
router.get('/products', meController.index);
router.get('/products/newest', meController.newestProducts);
router.get('/products/upcoming', meController.upcomingProducts);
// router.get('/products/appear/sale', meController.appearSaleProducts);
router.get('/products/weekly-deals', meController.weeklyDealProducts);
router.get('/colors', productsController.indexColor);
router.get('/genders', productsController.indexGender);
router.get('/sizes', productsController.indexSize);

// API Campaigns
router.get('/campaigns/campaign-with-products', campaignsController.campaignWithProduct);

// API Auth
router.post('/login', apiAuthController.login);
router.post('/refresh', apiAuthController.refresh);
router.post('/logout', apiAuthController.logout);
router.get('/me', authenticateToken, apiAuthController.me);

module.exports = router;
