const Redis = require('ioredis');

console.log('>>> REDIS_URL:', process.env.REDIS_URL);

const redis = new Redis(process.env.REDIS_URL, {
    tls: {
        rejectUnauthorized: false, // Upstash yêu cầu TLS
    },
});

redis.on('connect', () => {
    console.log('Connected to Redis (Upstash)');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;
