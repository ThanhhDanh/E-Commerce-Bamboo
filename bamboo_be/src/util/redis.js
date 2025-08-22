const Redis = require('ioredis');

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
