const Messages = require('../models/Messages');
const moment = require('moment');
const Users = require('../models/Users');
const Conversations = require('../models/Conversations');
const redisClient = require('../../util/redis');

class ChatController {
    //[GET] chat
    index(req, res, next) {
        res.render('chats/show');
    }

    //[GET] chat/messages/:userId
    async messages(req, res, next) {
        try {
            const { userId } = req.params;

            //Chỉ lấy các tin nhắn KH gửi cho bạn
            const messages = await Messages.find({
                receiverId: userId,
            })
                .sort({ sentAt: -1 })
                .limit(20)
                .lean();

            // Tìm thông tin người gửi
            const senderIds = [...new Set(messages.map((msg) => msg.senderId))];
            const users = await Users.find({ _id: { $in: senderIds } }).lean();

            const userMap = {};
            users.forEach((user) => {
                userMap[user._id] = user;
            });

            const formattedMessages = messages.map((msg) => {
                const sender = userMap[msg.senderId] || {};
                return {
                    ...msg,
                    senderName: `${sender.lastName || ''} ${sender.firstName || ''}`.trim() || 'Người lạ',
                    senderAvatar: sender.avatar || '/images/faces/face4.jpg',
                    formattedTime: moment(msg.sentAt).locale('vi').fromNow(),
                };
            });

            res.json(formattedMessages);
        } catch (err) {
            next(err);
        }
    }

    //[GET] chat/unread/:userId
    async unread(req, res, next) {
        try {
            const { userId } = req.params;
            const count = await Messages.countDocuments({
                receiverId: userId,
                isRead: false,
            });

            res.json({ unreadCount: count });
        } catch (err) {
            next(err);
        }
    }

    // [POST] /chat/mark-as-read/:userId
    async markAsRead(req, res, next) {
        try {
            const currentUserId = parseInt(req.session.userId || req.session.user?._id);
            const otherUserId = parseInt(req.params.userId);

            if (!currentUserId || !otherUserId) {
                return res.status(400).json({ message: 'Thiếu userId' });
            }

            const result = await Messages.updateMany(
                {
                    senderId: otherUserId,
                    receiverId: currentUserId,
                    isRead: false,
                },
                { $set: { isRead: true } },
            );

            res.json({ success: true, modifiedCount: result.modifiedCount });
        } catch (err) {
            next(err);
        }
    }

    //[GET] chat/conversations/:staffId
    async getConversations(req, res, next) {
        try {
            const { staffId } = req.params;

            const convos = await Conversations.find({
                participants: staffId,
            })
                .sort({ lastUpdated: -1 })
                .populate('participants');

            const result = await Promise.all(
                convos.map(async (convo) => {
                    const lastMsg = await Messages.findOne({ conversationId: convo._id }).sort({ sentAt: -1 }).lean();

                    const unreadCount = await Messages.countDocuments({
                        conversationId: convo._id,
                        receiverId: staffId,
                        isRead: false,
                    });

                    const otherUser = convo.participants.find((p) => p._id.toString() !== staffId);

                    return {
                        conversationId: convo._id,
                        user: {
                            _id: otherUser._id,
                            name: `${otherUser.lastName} ${otherUser.firstName}`,
                            avatar: otherUser.avatar || '/images/users/default-avatar.jpg',
                        },
                        lastMessage: lastMsg?.content,
                        lastTime: lastMsg?.sentAt || convo.lastUpdated,
                        unreadCount,
                    };
                }),
            );

            // Lưu vào Redis
            await redisClient.set(`conversations:${staffId}`, JSON.stringify(result));

            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    //[GET] chat/messages-with/:userId
    async getMessagesWithUser(req, res, next) {
        const currentUserId = parseInt(req.session.userId || req.session.user?._id);
        const otherUserId = parseInt(req.params.userId);

        if (!currentUserId || !otherUserId) {
            return res.status(400).json({ message: 'Thiếu userId hoặc không hợp lệ' });
        }

        try {
            // Lấy thông tin user đối phương
            const [currentUser, otherUser] = await Promise.all([
                Users.findOne({ _id: currentUserId }).select('_id firstName lastName avatar'),
                Users.findOne({ _id: otherUserId }).select('_id firstName lastName avatar'),
            ]);

            if (!currentUser || !otherUser) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            const messages = await Messages.find({
                $or: [
                    { senderId: currentUserId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: currentUserId },
                ],
            })
                .sort({ sentAt: 1 })
                .lean();

            const formatted = messages.map((msg) => {
                const sender = msg.senderId === currentUserId ? currentUser : otherUser;
                const receiver = msg.receiverId === currentUserId ? currentUser : otherUser;

                return {
                    content: msg.content,
                    isRead: msg.isRead,
                    sentAt: msg.sentAt,
                    timeFormatted: msg.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: {
                        id: msg.senderId,
                        name: sender.lastName + ' ' + sender.firstName,
                        avatar: sender.avatar,
                    },
                    receiver: {
                        id: msg.receiverId,
                        name: receiver.lastName + ' ' + receiver.firstName,
                        avatar: receiver.avatar,
                    },
                };
            });
            // Lưu vào Redis
            await redisClient.set(`chat:${currentUserId}:${otherUserId}`, JSON.stringify(formatted));

            // Lấy lại từ Redis
            const cached = await redisClient.get(`chat:${currentUserId}:${otherUserId}`);

            if (cached) {
                res.json({ user: otherUser, messages: JSON.parse(cached) });
            }
        } catch (err) {
            console.error('Lỗi khi lấy messages với user:', err);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = new ChatController();
