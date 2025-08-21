const express = require('express');
const router = express.Router();
const chatWebhookController = require('../app/controllers/ChatWebhookController');

router.post('/chat', chatWebhookController.store);

module.exports = router;
