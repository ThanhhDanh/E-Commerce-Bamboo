const Product = require('../models/Products');
const Shop = require('../models/Shops');
const { mutipleMongooseToObject } = require('../../util/mongoose');

class MeController {
    //API Frontend
    // [GET] /products
    index(req, res, next) {
        Product.find({})
            .sortable(req)
            .then((products) => {
                res.json(products);
            })
            .catch(next);
    }

    //[GET] /products/newest - Sản phẩm mới nhất
    newestProducts(req, res, next) {
        Product.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .then((newest) => {
                res.json(newest);
            })
            .catch(next);
    }

    //[GET] /products/upcoming - Sản phẩm ra mắt
    upcomingProducts(req, res, next) {
        Product.find({
            $and: [
                { isFeatured: true },
                { releaseDate: { $gte: new Date() } }, // Chưa đến ngày ra mắt
            ],
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .then((upcoming) => {
                res.json(upcoming);
            })
            .catch(next);
    }

    //[GET] /products/appear/sale - Sản phẩm ra mắt và đang giảm giá
    appearSaleProducts(req, res, next) {
        Product.find({
            $and: [{ isFeatured: true }, { releaseDate: { $gte: new Date() } }, { salePrice: { $ne: null } }],
        })
            .sort({ createdAt: -1 })
            .limit(3)
            .then((sale) => {
                res.json(sale);
            })
            .catch(next);
    }

    //[GET] /products/weekly-deals - Sản phẩm ưu đãi trong tuần
    weeklyDealProducts(req, res, next) {
        const now = new Date();

        Product.find({
            'weeklyDeal.isActive': true,
            'weeklyDeal.endDate': { $gte: now },
        })
            .sort({ createdAt: -1 })
            .populate('weeklyDeal.discountId')
            .then((weekly) => {
                res.json(weekly);
            })
            .catch(next);
    }

    // ==============================================================================================================//

    // [GET] /stored/products
    storedProducts(req, res, next) {
        Promise.all([Product.find({}).sortable(req), Product.countDocumentsWithDeleted({ deleted: true })])
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
        Product.findWithDeleted({ deleted: true })
            .then((products) =>
                res.render('me/trash-products', {
                    products: mutipleMongooseToObject(products),
                }),
            )
            .catch(next);
    }

    // [GET] /stored/shops
    storedShops(req, res, next) {
        Promise.all([Shop.find({}).sortable(req), Shop.countDocumentsWithDeleted({ deleted: true })])
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
        Shop.findWithDeleted({ deleted: true })
            .then((shops) =>
                res.render('me/trash-shops', {
                    shops: mutipleMongooseToObject(shops),
                }),
            )
            .catch(next);
    }
}

module.exports = new MeController();
