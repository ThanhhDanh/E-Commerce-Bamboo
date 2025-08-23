const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const useTls = redisUrl.startsWith('rediss://');

const redis = new Redis(redisUrl, {
    ...(useTls && { tls: { rejectUnauthorized: false } }),
});

redis.on('connect', () => {
    console.log('Connected to Redis (Upstash)');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;
