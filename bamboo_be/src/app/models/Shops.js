const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Shop = new Schema(
    {
        _id: { type: Number },
        name: { type: String, required: true },
        image: { type: String },
        address: { type: String },
        ownerId: { type: Number, ref: 'User', required: true },
        categoryId: [{ type: Number, ref: 'Category', required: true }],
        slug: { type: String, slug: 'name', unique: true },
    },
    {
        _id: false,
        timestamps: true,
    },
);

//Custom query helpers
Shop.query.sortable = function (req) {
    if (req.query.hasOwnProperty('_sort')) {
        const isValidType = ['asc', 'desc'].includes(req.query.type);
        return this.sort({
            [req.query.column]: isValidType ? req.query.type : 'desc',
        });
    }
    return this;
};

Shop.plugin(AutoIncrement, { id: 'shop_id', inc_field: '_id' });
Shop.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Shop', Shop);
