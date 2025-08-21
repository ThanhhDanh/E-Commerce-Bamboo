const crypto = require('crypto');
const secret = '12345678901234567890123456789012';
const iv = '1234567890123456';

module.exports = (encrypted) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), Buffer.from(iv));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
