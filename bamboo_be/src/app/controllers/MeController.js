const Products = require('../models/Products');
const Shops = require('../models/Shops');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const Campaigns = require('../models/Campaigns');
const CampaignProducts = require('../models/CampaignProducts');
const OrderDetails = require('../models/OrderDetails');
const { mergeCampaignPrice } = require('../../helpers/handlebars');

class MeController {
    //API Frontend
    // [GET] /products - danh sách sản phẩm cho người dùng mua
    async index(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const sortQuery = {};
            if (req.query.sort) {
                req.query.sort.split(',').forEach((field) => {
                    const direction = field.startsWith('-') ? -1 : 1;
                    sortQuery[field.replace('-', '')] = direction;
                });
            }

            const filter = {};
            if (req.query.category) filter.categoryId = req.query.category;

            const products = await Products.find(filter).sort(sortQuery).skip(skip).limit(limit);

            const productsWithSale = await mergeCampaignPrice(products);

            const total = await Products.countDocuments(filter);

            res.json({
                data: productsWithSale,
                pagination: {
                    currentPage: page,
                    totalItems: total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (err) {
            next(err);
        }
    }

    //[GET] /products/newest - Sản phẩm mới nhất
    async newestProducts(req, res, next) {
        try {
            const newest = await Products.find({
                $or: [{ isFeatured: false }, { releaseDate: { $lt: new Date() } }],
            })
                .populate('categoryId', 'name slug')
                .sort({ createdAt: -1 })
                .limit(12);

            //Không có newest thì fallback qua best-selling
            if (!newest.length) {
                return this.bestSellingProducts(req, res, next);
            }

            const merged = await mergeCampaignPrice(newest);

            res.json(merged);
        } catch (err) {
            next(err);
        }
    }

    //[GET] /products/upcoming - Sản phẩm ra mắt
    async upcomingProducts(req, res, next) {
        try {
            const upcoming = await Products.find({
                isFeatured: true,
                releaseDate: { $gte: new Date() }, // Chưa đến ngày ra mắt
            })
                .populate('categoryId', 'name slug')
                .sort({ createdAt: -1 })
                .limit(12);

            //Nếu không có upcoming thì fallback sang best-selling
            if (!upcoming.length) {
                return this.bestSellingProducts(req, res, next);
            }

            const merged = await mergeCampaignPrice(upcoming);

            res.json(merged);
        } catch (err) {
            next(err);
        }
    }

    //[GET] /products/appear/sale - Sản phẩm ra mắt và đang giảm giá
    // appearSaleProducts(req, res, next) {
    //     Product.find({
    //         $and: [{ isFeatured: true }, { releaseDate: { $gte: new Date() } }, { salePrice: { $ne: null } }],
    //     })
    //         .sort({ createdAt: -1 })
    //         .limit(3)
    //         .then((sale) => {
    //             res.json(sale);
    //         })
    //         .catch(next);
    // }

    //[GET] /products/weekly-deals - Sản phẩm ưu đãi trong tuần
    async weeklyDealProducts(req, res, next) {
        try {
            const now = new Date();

            const campaign = await Campaigns.findOne({
                type: 'weekly',
                startDate: { $lte: now },
                endDate: { $gte: now },
            }).limit(9);

            if (!campaign) return res.json([]);

            const campaignProducts = await CampaignProducts.find({ campaignId: campaign._id }).populate({
                path: 'productId',
                populate: { path: 'categoryId', select: 'name slug' },
            });

            const products = campaignProducts.map((cp) => {
                const product = cp.productId.toObject();
                product.salePrice = cp.salePrice ?? product.price;
                return product;
            });

            res.json(products);
        } catch (err) {
            next(err);
        }
    }

    //[GET] /products/best-selling
    async bestSellingProducts(req, res, next) {
        try {
            const bestSelling = await OrderDetails.aggregate([
                { $group: { _id: '$productId', quantity: { $sum: '$quantity' } } },
                { $sort: { quantity: -1 } },
                { $limit: 12 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                { $unwind: '$product' },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'product.categoryId',
                        foreignField: '_id',
                        as: 'product.categoryId',
                    },
                },
                { $unwind: { path: '$product.categoryId', preserveNullAndEmptyArrays: true } },
            ]);

            const products = bestSelling.map((item) => item.product);

            const productsWithSale = await mergeCampaignPrice(products);

            res.json(productsWithSale);
        } catch (err) {
            next(err);
        }
    }

    // ==============================================================================================================//

    // [GET] /stored/products
    storedProducts(req, res, next) {
        Promise.all([Products.find({}).sortable(req), Products.countDocumentsWithDeleted({ deleted: true })])
            .then(([products, deletedCount]) =>
                res.render('me/stored-products', {
                    deletedCount,
                    products: mutipleMongooseToObject(products),
                }),
            )
            .catch(next);
    }

    // [GET] /trash/products
    trashProducts(req, res, next) {
        Products.findWithDeleted({ deleted: true })
            .then((products) =>
                res.render('me/trash-products', {
                    products: mutipleMongooseToObject(products),
                }),
            )
            .catch(next);
    }

    // [GET] /stored/shops
    storedShops(req, res, next) {
        Promise.all([Shops.find({}).sortable(req), Shops.countDocumentsWithDeleted({ deleted: true })])
            .then(([shops, deletedCount]) =>
                res.render('me/stored-shops', {
                    deletedCount,
                    shops: mutipleMongooseToObject(shops),
                }),
            )
            .catch(next);
    }

    // [GET] /trash/shops
    trashShops(req, res, next) {
        Shops.findWithDeleted({ deleted: true })
            .then((shops) =>
                res.render('me/trash-shops', {
                    shops: mutipleMongooseToObject(shops),
                }),
            )
            .catch(next);
    }
}

module.exports = new MeController();
