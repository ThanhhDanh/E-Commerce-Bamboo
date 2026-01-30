const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const useTls = redisUrl.startsWith('rediss://');

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 50, 2000), // retry sau 50ms, max 2s
    ...(useTls && { tls: { rejectUnauthorized: false } }),
});

const messageQueue = new Queue('messages', { connection });

module.exports = {
    messageQueue,
    Worker,
    connection,
};
