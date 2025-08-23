const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

let connection;

if (process.env.REDIS_URL === 'production') {
    connection = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        tls: {
            rejectUnauthorized: false,
        },
    });
} else {
    connection = new IORedis({
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });
}

const messageQueue = new Queue('messages', { connection });

module.exports = {
    messageQueue,
    Worker,
    connection,
};
