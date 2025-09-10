const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const CampaignProduct = new Schema(
    {
        _id: { type: Number },
        campaignId: { type: Number, ref: 'Campaign', required: true },
        productId: { type: Number, ref: 'Product', required: true },
        discountId: { type: Number, ref: 'Discount', default: null },
        // nếu muốn override giá trong campaign thì thêm field này
        salePrice: { type: Number, default: null },
    },
    {
        _id: false,
        timestamps: true,
    },
);

CampaignProduct.plugin(AutoIncrement, { id: 'campaignProduct_id', inc_field: '_id' });
CampaignProduct.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('CampaignProduct', CampaignProduct);
