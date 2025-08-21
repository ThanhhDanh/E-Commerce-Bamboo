const Product = require('../models/Products');
const Shop = require('../models/Shops');
const {mutipleMongooseToObject} = require('../../util/mongoose');

class MeController {

    // [GET] /stored/products
    storedProducts(req, res, next) {
        Promise.all([
            Product.find({}).sortable(req), 
            Product.countDocumentsWithDeleted({ deleted: true })
        ])
            .then(([products, deletedCount]) =>
                res.render('me/stored-products', {
                    deletedCount,
                    products: mutipleMongooseToObject(products)
                })
            )
            .catch(next);
    }

    // [GET] /trash/products
    trashProducts(req, res, next) {
        Product.findWithDeleted({deleted: true})
        .then(products => res.render('me/trash-products', {
            products: mutipleMongooseToObject(products)
        }))
        .catch(next);
    }

    // [GET] /stored/shops
    storedShops(req, res, next) {
        Promise.all([
            Shop.find({}).sortable(req), 
            Shop.countDocumentsWithDeleted({ deleted: true })
        ])
            .then(([shops, deletedCount]) =>
                res.render('me/stored-shops', {
                    deletedCount,
                    shops: mutipleMongooseToObject(shops)
                })
            )
            .catch(next);
    }

    // [GET] /trash/shops
    trashShops(req, res, next) {
        Shop.findWithDeleted({deleted: true})
        .then(shops => res.render('me/trash-shops', {
            shops: mutipleMongooseToObject(shops)
        }))
        .catch(next);
    }

}

module.exports = new MeController();