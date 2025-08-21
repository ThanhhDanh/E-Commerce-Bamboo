const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const OrderDetail = new Schema(
    {
        _id: { type: Number },
        quantity: { type: Number },
        unitPrice: { type: Number },
        statusPayment: { type: String },
        methodPayment: { type: String },
        discountId: { type: Number, ref: 'Discount', required: 'true' },
        productId: { type: Number, ref: 'Product', required: 'true' },
        orderId: { type: Number, ref: 'Order', required: 'true' },
        sizeIds: [{ type: Number, ref: 'Size' }],
        colorIds: [{ type: Number, ref: 'Color' }],
    },
    {
        _id: false,
        timestamps: true,
    },
);

OrderDetail.plugin(AutoIncrement, { id: 'orderDetail_id', inc_field: '_id' });
OrderDetail.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('OrderDetail', OrderDetail);
