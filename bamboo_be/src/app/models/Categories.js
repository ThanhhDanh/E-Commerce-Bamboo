const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Category = new Schema(
{
    _id: {type: Number},
    name: { type: String, required: true},
    slug: { type: String, slug: "name", unique: true },
}, {
    _id: false,
    timestamps: true,
});


Category.plugin(AutoIncrement, { id: 'category_id', inc_field: '_id' });
Category.plugin(mongooseDelete, { 
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Category', Category);