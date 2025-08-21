const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Discount = new Schema(
    {
        _id: { type: Number },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number },
        expirateTime: { type: Date },
        amount: { type: String },
    },
    {
        _id: false,
        timestamps: true,
    },
);

Discount.plugin(AutoIncrement, { id: 'discount_id', inc_field: '_id' });
Discount.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Discount', Discount);
