const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const User = new Schema(
{
    _id: { type: Number },
    address: { type: String },
    avatar: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true},
    role: { type: String, enum: ['user', 'admin', 'employee', 'seller'], default: 'user' },
    slug: { type: String, slug: "firstName", unique: true },

    discounts: [{
        discountId: { type: Number, ref: 'Discount' },
        used: { type: Boolean, default: false },
    }],
}, {
    _id: false,
    timestamps: true,
});


User.plugin(AutoIncrement, { id: 'user_id', inc_field: '_id' });
User.plugin(mongooseDelete, { 
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('User', User);