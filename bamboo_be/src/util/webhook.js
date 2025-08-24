const axios = require('axios');

const WEBHOOK_URL = process.env.BE_WEBHOOK_URL || 'http://127.0.0.1:3000';

async function sendWebhook(receiverId, message) {
    // Sử dụng webhook của nhân viên dashboard nhận
    await axios.post(`${WEBHOOK_URL}/webhook/chat`, {
        receiver: receiverId,
        content: message.content,
        time: message.sentAt,
        senderId: message.senderId,
    });

    console.log('Webhook sent to webhook.site');
}

module.exports = sendWebhook;
