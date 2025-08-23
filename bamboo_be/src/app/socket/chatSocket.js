const Message = require('../models/Messages');
const Conversation = require('../models/Conversations');
const sendWebhook = require('../../util/webhook');
const redisClient = require('../../util/redis');
const { messageQueue } = require('../../util/messageQueue');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Socket ${socket.id} connected`);

        // Join room theo userId
        socket.on('join', async (userId) => {
            socket.join(String(userId));
            await redisClient.set(`online:${userId}`, '1', 'EX', 60 * 5);
            console.log(`User ${userId} joined room`);
        });

        // Gửi tin nhắn
        socket.on('send_message', async (data) => {
            console.log('Received send_message:', data);
            const { senderId, receiverId, content, sentAt } = data;

            //Đẩy tin nhắn vào Queue
            await messageQueue.add('send', data);

            // Kiểm tra cuộc trò chuyện đã có chưa
            let conversation = await Conversation.findOne({
                participants: { $all: [senderId, receiverId] },
            });

            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [senderId, receiverId],
                    lastMessage: content,
                });

                // Gửi thông báo người mới nhắn tới nhân viên
                io.to(String(receiverId)).emit('new_conversation', {
                    fromUserId: senderId,
                    conversation,
                });
            } else {
                conversation.lastMessage = content;
                conversation.lastUpdated = new Date();
                await conversation.save();
            }

            // Tạo tin nhắn
            const message = await Message.create({
                senderId,
                receiverId,
                content,
                conversationId: conversation._id,
                sentAt: sentAt || new Date(),
            });

            const populatedMessage = await Message.findById(message._id)
                .populate('senderId', 'firstName lastName avatar')
                .lean();

            console.log('Emit receive_message tới:', senderId, receiverId);
            console.log('Message content:', populatedMessage);

            // Format lại dữ liệu gửi ra
            const messageData = {
                _id: populatedMessage._id,
                senderId: populatedMessage.senderId._id,
                senderName: populatedMessage.senderId.firstName + ' ' + populatedMessage.senderId.lastName,
                senderAvatar: populatedMessage.senderId.avatar,
                receiverId: populatedMessage.receiverId,
                content: populatedMessage.content,
                sentAt: populatedMessage.sentAt,
            };

            // Gửi message đến cả 2 bên
            io.to(String(senderId)).emit('receive_message', messageData);
            io.to(String(receiverId)).emit('receive_message', messageData);

            // Emit cập nhật sidebar cho cả 2 bên
            io.to(String(senderId)).emit('update_sidebar_last_message', {
                userId: receiverId,
                lastMessage: content,
            });

            io.to(String(receiverId)).emit('update_sidebar_last_message', {
                userId: senderId,
                lastMessage: content,
            });

            //Gửi webhook
            // await sendWebhook(receiverId, message);
        });

        socket.on('disconnect', () => {
            console.log(`Client ${socket.id} disconnected`);
        });
    });
};
