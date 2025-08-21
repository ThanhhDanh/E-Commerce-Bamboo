const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Conversation = new Schema(
    {
        _id: { type: Number },
        participants: [{ type: Number, ref: 'User' }], // [userId1, userId2]
        lastMessage: String,
        lastUpdated: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    },
);

Conversation.plugin(AutoIncrement, { id: 'conversation_id', inc_field: '_id' });
Conversation.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Conversation', Conversation);
