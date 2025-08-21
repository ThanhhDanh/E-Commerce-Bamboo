const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Like = new Schema(
{
    _id: {type: Number},
    active: {type: Boolean},
    productId: {type: Number, ref: 'Product', required: true},
    userId: {type: Number, ref: 'User', required: true},
}, {
    _id: false,
    timestamps: true,
});


Like.plugin(AutoIncrement, { id: 'like_id', inc_field: '_id' });
Like.plugin(mongooseDelete, { 
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Like', Like);