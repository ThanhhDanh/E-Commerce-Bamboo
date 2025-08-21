const Category = require('../models/Categories');
const { mongodbToObject, mutipleMongooseToObject } = require('../../util/mongoose');

class CategoryController {
    //API Frontend
    // [GET] /categories
    index(req, res, next) {
        Category.find({})
            .then((categories) => {
                res.json(categories); // trả dữ liệu JSON
            })
            .catch(next);
    }

    // [POST] /categories
    storeAPI(req, res, next) {
        const category = new Category(req.body);
        category
            .save()
            .then(() => res.status(201).json({ message: 'Tạo thành công!' }))
            .catch(next);
    }

    // [GET] /categories/create
    create(req, res, next) {
        Category.find({})
            .then((categories) => {
                res.render('categories/create', {
                    categories: mutipleMongooseToObject(categories),
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

module.exports = new CategoryController();
