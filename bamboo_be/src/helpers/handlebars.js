const Handlebars = require('handlebars');
const CampaignProducts = require('../app/models/CampaignProducts');

module.exports = {
    sum: (a, b) => a + b,
    eq: (a, b) => a == b,
    sortable: (field, sort) => {
        const sortType = field == sort.column ? sort.type : 'default';
        const icons = {
            default: 'fa-solid fa-sort',
            asc: 'fa-solid fa-arrow-down-short-wide',
            desc: 'fa-solid fa-arrow-down-wide-short',
        };

        const types = {
            default: 'desc',
            asc: 'desc',
            desc: 'asc',
        };

        const icon = icons[sortType];
        const type = types[sortType];

        const href = Handlebars.escapeExpression(`?_sort&column=${field}&type=${type}`);

        const output = `<a href="${href}">
            <i class="${icon} icon-sort"></i>
      </a>`;
        return new Handlebars.SafeString(output);
    },
    isActive: (currentPath, linkPath, options) => {
        return currentPath === linkPath ? 'active' : '';
    },
    arrayContains: function (array, value) {
        if (Array.isArray(array)) {
            return array.includes(value) ? 'selected' : '';
        }
        return '';
    },
    json: function (context) {
        return JSON.stringify(context);
    },
    checkStatus: function (status) {
        const statusMap = {
            Paid: 0,
            Pending: 1,
            Cancel: 2,
        };
        return statusMap[status] === 0
            ? 'paid'
            : statusMap[status] === 1
              ? 'pending text-warning'
              : statusMap[status] === 2
                ? 'cancel'
                : '';
    },
    checkTextStatus: function (text) {
        const statusMap = {
            Paid: 0,
            Pending: 1,
            Cancel: 2,
        };
        return statusMap[text] === 0
            ? 'Đã trả'
            : statusMap[text] === 1
              ? 'Đang chờ thanh toán'
              : statusMap[text] === 2
                ? 'Hủy thanh toán'
                : '';
    },
    mergeCampaignPrice: async function (products) {
        const productIds = products.map((p) => p._id);

        const campaigns = await CampaignProducts.find({
            productId: { $in: productIds },
        });

        return products.map((p) => {
            const campaign = campaigns.find((c) => String(c.productId) === String(p._id));

            return {
                ...p.toObject(),
                salePrice: campaign ? campaign.salePrice : 0,
            };
        });
    },
};
