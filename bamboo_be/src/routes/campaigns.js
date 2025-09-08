const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const campaignsController = require('../app/controllers/CampaignController');
const validate = require('../app/middlewares/validateMiddleware');

router.get('/:id/products', campaignsController.manageProducts);
router.post('/:id/products', campaignsController.updateProducts);
router.put('/:id/edit', campaignsController.update);
router.delete('/:id', campaignsController.delete);
router.get('/', campaignsController.index);
router.post('/store', campaignsController.store);

module.exports = router;
