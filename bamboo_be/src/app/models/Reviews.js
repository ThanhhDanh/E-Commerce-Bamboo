const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Review = new Schema(
{
    _id: {type: Number},
    rating: {type: Number},
    commentId: {type: Number, ref: 'Comment', required: true},
    productId: {type: Number, ref: 'Product', required: true},
    userId: {type: Number, ref: 'User', required: true},
}, {
    _id: false,
    timestamps: true,
});


Review.plugin(AutoIncrement, { id: 'review_id', inc_field: '_id' });
Review.plugin(mongooseDelete, { 
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Review', Review);