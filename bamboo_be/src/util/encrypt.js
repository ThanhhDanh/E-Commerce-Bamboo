const crypto = require('crypto');
const secret = '12345678901234567890123456789012';
const iv = '1234567890123456';

module.exports = (text) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), Buffer.from(iv));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};
