const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Order = new Schema(
    {
        _id: { type: Number },
        totalAmount: { type: Number },
        signature: { type: String },
        description: { type: String },
        status: { type: String },
        methodPayment: { type: String },
        userId: { type: Number, ref: 'User', required: 'true' },
        slug: { type: String, slug: 'signature', unique: true },
    },
    {
        _id: false,
        timestamps: true,
    },
);

Order.plugin(AutoIncrement, { id: 'order_id', inc_field: '_id' });
Order.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Order', Order);
