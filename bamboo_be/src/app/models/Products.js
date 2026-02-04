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
        isFeatured: { type: Boolean, default: false },
        groundType: {
            type: String,
            enum: ['FG', 'AG', 'TF', 'IC', 'SG', 'Indoor'],
            required: false,
        },
        releaseDate: { type: Date, default: null },
        genderId: { type: Number, ref: 'Gender', required: true },
        userId: { type: Number, ref: 'User', required: true },
        categoryId: { type: Number, ref: 'Category', required: true },
        shopId: { type: Number, ref: 'Shop', required: true },
        sizeIds: [{ type: Number, ref: 'Size' }],
        colorVariants: [
            {
                colorId: { type: Number, ref: 'Color' },
                image: { type: String },
            },
        ],
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
