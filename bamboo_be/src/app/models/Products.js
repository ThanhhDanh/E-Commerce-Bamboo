const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Product = new Schema(
    {
        _id: { type: Number },
        name: { type: String, required: true },
        image: { type: String },
        description: { type: String },
        price: { type: Number, required: true },
        salePrice: { type: Number, default: null },
        discountId: { type: Number, ref: 'Discount', default: null },
        isFeatured: { type: Boolean, default: false },
        releaseDate: { type: Date, default: null },
        weeklyDeal: {
            isActive: { type: Boolean, default: false },
            discountId: { type: Number, ref: 'Discount', default: null },
            startDate: { type: Date, default: null },
            endDate: { type: Date, default: null },
        },
        genderId: { type: Number, ref: 'Gender', required: true },
        userId: { type: Number, ref: 'User', required: true },
        categoryId: { type: Number, ref: 'Category', required: true },
        shopId: { type: Number, ref: 'Shop', required: true },
        sizeIds: [{ type: Number, ref: 'Size' }],
        colorIds: [{ type: Number, ref: 'Color' }],
        slug: { type: String, slug: 'name', unique: true },
    },
    {
        _id: false,
        timestamps: true,
    },
);

//Custom query helpers
Product.query.sortable = function (req) {
    if (req.query.hasOwnProperty('_sort')) {
        const isValidType = ['asc', 'desc'].includes(req.query.type);
        return this.sort({
            [req.query.column]: isValidType ? req.query.type : 'desc',
        });
    }
    return this;
};

Product.plugin(AutoIncrement, { id: 'product_id', inc_field: '_id' });
Product.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Product', Product);
