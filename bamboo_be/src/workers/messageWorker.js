const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const Conversations = require('../app/models/Conversations');
const Messages = require('../app/models/Messages');
const sendWebhook = require('../util/webhook');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const useTls = redisUrl.startsWith('rediss://');

const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    ...(useTls && { tls: { rejectUnauthorized: false } }),
});

new Worker(
    'messages',
    async (job) => {
        const { senderId, receiverId, content, sentAt } = job.data;
        // Process the message here
        console.log(`Processing message from ${senderId} to ${receiverId}: ${content} at ${sentAt}`);

        let conversation = await Conversations.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversations.create({
                participants: [senderId, receiverId],
                lastMessage: content,
            });
        } else {
            conversation.lastMessage = content;
            conversation.lastUpdated = new Date();
            await conversation.save();
        }

        const message = await Messages.create({
            senderId,
            receiverId,
            content,
            conversationId: conversation._id,
            sentAt: sentAt || new Date(),
        });

        await sendWebhook(receiverId, message);
    },
    { connection, concurrency: 1 },
);
