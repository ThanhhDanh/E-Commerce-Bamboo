const Category = require('../models/Categories');
const {mongodbToObject, mutipleMongooseToObject} = require('../../util/mongoose');

class ProductController {
    // [GET] /categories/create
    create(req, res, next) {
        Category.find({})
            .then(categories => {
                res.render('categories/create', {
                    categories: mutipleMongooseToObject(categories)
                });
            })
            .catch(next);
    }

    // [POST] /categories/store
    store(req, res, next) {
        const category = new Category(req.body);
        category
            .save()
            .then(() => res.redirect('/categories/create'))
            .catch(next);
    }
}


module.exports = new ProductController();