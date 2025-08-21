const express = require('express');
const router = express.Router();
const chatController = require('../app/controllers/ChatController');

router.get('/', chatController.index);
router.get('/unread/:userId', chatController.unread);
router.post('/mark-as-read/:userId', chatController.markAsRead);
router.get('/messages/:userId', chatController.messages);
router.get('/conversations/:staffId', chatController.getConversations);
router.get('/messages-with/:userId', chatController.getMessagesWithUser);

module.exports = router;
