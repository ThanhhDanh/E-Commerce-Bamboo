const Campaign = require('../models/Campaigns');
const { mongodbToObject, mutipleMongooseToObject } = require('../../util/mongoose');
const CampaignProducts = require('../models/CampaignProducts');
const Products = require('../models/Products');
const Discounts = require('../models/Discounts');
const dayjs = require('dayjs');

class CampaignController {
    //API Frontend
    //[GET] /campaigns/:campaignId/products
    async campaignWithProduct(req, res, next) {
        try {
            const campaignId = req.params.campaignId;
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) return res.status(404).json({ message: 'Không tìm thấy campaign' });

            const campaignProducts = await CampaignProducts.find({ campaignId }).populate('productId');

            const products = campaignProducts.map((cp) => {
                const product = cp.productId.toObject();
                product.salePrice = cp.salePrice ?? product.price;
                return product;
            });

            res.json({ campaign, products });
        } catch (err) {
            next(err);
        }
    }

    // [GET] /campaigns/active-products - Lấy sản phẩm từ tất cả Campaign đang active
    async activeCampaignProducts(req, res, next) {
        try {
            const now = new Date();

            console.log('now: ', now);

            // Lấy campaign đang diễn ra
            const campaigns = await Campaign.find({
                startDate: { $lte: now },
                endDate: { $gte: now },
            });

            console.log('campaigns:', campaigns);

            if (!campaigns.length) {
                return res.json([]);
            }

            // Lấy product của tất cả campaign active
            const campaignProducts = await CampaignProducts.find({
                campaignId: { $in: campaigns.map((c) => c._id) },
            }).populate('productId');

            const products = campaignProducts.map((cp) => ({
                ...cp.productId.toObject(),
                salePrice: cp.salePrice ?? cp.productId.price,
            }));

            res.json(products);
        } catch (err) {
            next(err);
        }
    }

    // ==============================================================================================================//

    //[GET /campaigns
    index(req, res, next) {
        Campaign.find({})
            .then((campaigns) => {
                res.render('campaigns/create', {
                    campaigns: mutipleMongooseToObject(campaigns),
                });
            })
            .catch(next);
    }

    //[POST /campaigns/store
    store(req, res, next) {
        const campaign = new Campaign(req.body);
        campaign
            .save()
            .then(() => {
                res.redirect('/campaigns');
            })
            .catch(next);
    }

    //[PUT] /campaigns/:id/edit
    update(req, res, next) {
        const { startDate, endDate, ...rest } = req.body;

        const newStart = dayjs(startDate).tz('Asia/Ho_Chi_Minh').startOf('day').toDate();
        const newEnd = dayjs(endDate).tz('Asia/Ho_Chi_Minh').endOf('day').toDate();

        Campaign.findByIdAndUpdate(req.params.id, { ...rest, startDate: newStart, endDate: newEnd }, { new: true })
            .then((updated) => res.json(updated))
            .catch(next);
    }

    //[DELETE] /campaigns/:id
    delete(req, res, next) {
        Campaign.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [GET] /campaigns/:id/products
    async manageProducts(req, res, next) {
        try {
            const campaign = await Campaign.findById(req.params.id);
            const products = await Products.find({}).lean();
            const discounts = await Discounts.find({}).lean();
            const campaignProducts = await CampaignProducts.find({ campaignId: campaign._id }).lean();

            // Map productId -> salePrice
            const productMap = {};
            campaignProducts.forEach((cp) => {
                productMap[cp.productId] = {
                    salePrice: cp.salePrice,
                    discountId: cp.discountId || null,
                };
            });

            //Gắn vào products
            products.forEach((p) => {
                if (productMap[p._id]) {
                    p.salePrice = productMap[p._id].salePrice;
                    p.selectedDiscountId = productMap[p._id].discountId;
                    p.checked = true;
                }
            });

            res.render('campaigns/manage-products', {
                campaign: mongodbToObject(campaign),
                products,
                discounts,
            });
        } catch (err) {
            next(err);
        }
    }

    // [POST] /campaigns/:id/products
    async updateProducts(req, res, next) {
        try {
            console.log(req.body);

            const { selectedProducts = [], salePrices = {}, discounts = {} } = req.body;
            const campaignId = req.params.id;

            // Xoá hết record cũ của campaign này
            await CampaignProducts.deleteMany({ campaignId });

            // Insert lại theo form submit
            const bulk = await Promise.all(
                selectedProducts.map(async (productId) => {
                    const key = 'p' + productId;
                    const rawSalePrice = salePrices[key];
                    const discountId = discounts[key] && discounts[key] !== '' ? discounts[key] : null;

                    let finalSalePrice = null;

                    if (rawSalePrice && rawSalePrice.trim() !== '') {
                        finalSalePrice = Number(rawSalePrice);
                    } else if (discountId) {
                        const discount = await Discount.findById(discountId);
                        const product = await Products.findById(productId);
                        if (discount && product) {
                            finalSalePrice = Math.round(product.price * (1 - discount.percent / 100));
                        }
                    }

                    return {
                        campaignId,
                        productId,
                        salePrice: finalSalePrice,
                        discountId,
                    };
                }),
            );
            if (bulk.length) await CampaignProducts.insertMany(bulk);

            res.redirect('/campaigns');
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CampaignController();
