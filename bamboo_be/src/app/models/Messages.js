const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Message = new Schema(
    {
        _id: { type: Number },
        conversationId: { type: Number, ref: 'Conversation', required: true },
        senderId: { type: Number, ref: 'User', required: true },
        receiverId: { type: Number, ref: 'User', required: true },
        content: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

Message.plugin(AutoIncrement, { id: 'message_id', inc_field: '_id' });
Message.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Message', Message);
