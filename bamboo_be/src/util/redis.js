const Redis = require('ioredis');

let redis;

if (process.env.REDIS_URL === 'production') {
    redis = new Redis(process.env.REDIS_URL, {
        tls: {
            rejectUnauthorized: false, // Upstash yêu cầu TLS
        },
    });
} else {
    redis = new Redis({});
}

redis.on('connect', () => {
    console.log('Connected to Redis (Upstash)');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;
