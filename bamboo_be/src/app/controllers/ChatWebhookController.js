const Conversations = require('../models/Conversations');
const Messages = require('../models/Messages');
const Users = require('../models/Users');

class ChatWebhookController {
    // [POST] webhook/chat
    async store(req, res, next) {
        try {
            const { receiver, content, time, senderId } = req.body;

            if (!receiver || !content || !senderId) {
                return res.status(400).json({ error: 'Thiếu dữ liệu' });
            }

            // Tìm hoặc tạo cuộc trò chuyện
            let convo = await Conversations.findOne({
                participants: { $all: [senderId, receiver] },
            });

            if (!convo) {
                convo = await Conversations.create({
                    participants: [senderId, receiver],
                    lastMessage: content,
                });
            } else {
                convo.lastMessage = content;
                convo.lastUpdated = new Date();
                await convo.save();
            }

            // Tạo message
            const message = await Messages.create({
                conversationId: convo._id,
                senderId,
                receiverId: receiver,
                content,
                sentAt: time || new Date(),
            });

            // Lấy tên người gửi
            const sender = await Users.findById(senderId);
            // console.log('Sender:', sender);

            // Emit đến 2 người (nếu có socket)
            const io = req.app.get('io');
            if (io) {
                const messageWithSenderName = {
                    ...message._doc,
                    senderName: sender?.lastName + ' ' + sender?.firstName || 'Người lạ',
                    senderAvatar: sender?.avatar,
                };

                io.to(String(senderId)).emit('receive_message', messageWithSenderName);
                io.to(String(receiver)).emit('receive_message', messageWithSenderName);
                // console.log(`Emit từ webhook:`, messageWithSenderName);
            }

            return res.json({ success: true, message });
        } catch (err) {
            console.error('Lỗi xử lý webhook:', err);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = new ChatWebhookController();
