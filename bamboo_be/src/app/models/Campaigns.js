const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Campaign = new Schema(
    {
        _id: { type: Number },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['flash', 'weekly', 'sale', 'voucher'],
            default: 'sale',
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        slug: { type: String, slug: 'name', unique: true },
    },
    {
        _id: false,
        timestamps: true,
    },
);

Campaign.plugin(AutoIncrement, { id: 'campaign_id', inc_field: '_id' });
Campaign.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Campaign', Campaign);
