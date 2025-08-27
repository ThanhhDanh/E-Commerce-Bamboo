const Discount = require('../app/models/Discounts');

class DiscountCache {
    constructor() {
        this.cache = {};
    }

    async load() {
        const discounts = await Discount.find();
        discounts.forEach((d) => {
            this.cache[d._id.toString()] = d;
        });
    }

    get(discountId) {
        return this.cache[discountId?.toString()] || null;
    }

    async refresh() {
        await this.load();
    }
}

module.exports = new DiscountCache();
