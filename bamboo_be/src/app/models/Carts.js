const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const CartItemSchema = new Schema({
    productId: { type: Number, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    sizeIds: [{ type: Number, ref: 'Size' }],
    colorIds: [{ type: Number, ref: 'Color' }],
    salePrice: { type: Number, default: 0 },
});

const CartSchema = new Schema(
    {
        _id: { type: Number },
        userId: { type: Number, ref: 'User', required: true },
        items: [CartItemSchema],
    },
    {
        _id: false,
        timestamps: true,
    },
);

CartSchema.plugin(AutoIncrement, { id: 'cart_id', inc_field: '_id' });
CartSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Cart', CartSchema);
