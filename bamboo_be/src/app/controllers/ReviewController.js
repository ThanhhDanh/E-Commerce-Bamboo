const Review = require('../models/Reviews');
const Comment = require('../models/Comments');
const Product = require('../models/Products');
const User = require('../models/Users');
const {mongodbToObject, mutipleMongooseToObject} = require('../../util/mongoose');

class ReviewController {
    //[GET] /reviews/create
    create(req, res, next) {
        Promise.all([
            Comment.find(),
            Product.find(),
            User.find({role: 'user'}),
            Review.find(),
        ])
            .then(([comments, products, users, reviews]) => {
                res.render('reviews/create', {
                    comments: mutipleMongooseToObject(comments),
                    products: mutipleMongooseToObject(products),
                    users: mutipleMongooseToObject(users),
                    reviews: mutipleMongooseToObject(reviews),
                });
            })
            .catch(next);
    }

    //[POST] /reviews/store
    store(req, res, next) {
        const reviews = new Review(req.body);
        reviews
            .save()
            .then(() => res.render('reviews/create'))
            .catch(next);
    }

    //[DELETE] /reviews/:id/force
    deleteForce(req, res, next) {
        Review.deleteOne({_id: req.params.id})
            .then(()=> res.redirect('back'))
            .catch(next);
    }
}

module.exports = new ReviewController();