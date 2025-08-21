const axios = require('axios');

async function sendWebhook(receiverId, message) {
    // Sử dụng webhook của nhân viên dashboard nhận
    await axios.post('http://127.0.0.1:3000/webhook/chat', {
        receiver: receiverId,
        content: message.content,
        time: message.sentAt,
        senderId: message.senderId,
    });

    console.log('Webhook sent to webhook.site');
}

module.exports = sendWebhook;
