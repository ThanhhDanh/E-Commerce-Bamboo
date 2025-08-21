const {mongodbToObject, mutipleMongooseToObject} = require('../../util/mongoose');
const Product = require('../models/Products');
const User = require('../models/Users');
const Like = require('../models/Likes');

class LikeController {

    //[GET] /likes/create
    create(req, res, next) {
        Promise.all([
            Product.find({}), 
            User.find({role: 'user'}),
            Like.find({active: 'true'}),
        ])
            .then(([products, users, likes]) => {
                res.render('likes/create',{
                    products: mutipleMongooseToObject(products),
                    users: mutipleMongooseToObject(users),
                    likes: mutipleMongooseToObject(likes),
                })
            })
            .catch(next);
    }

    //[POST] /likes/store
    store(req, res, next) {
        const { userId, productId } = req.body;
        // Nếu chưa like, thì tạo mới
        const newLike = new Like({ userId, productId, active: true });
        newLike
            .save()
            .then(() => {
            res.redirect('/likes/create');
            })
            .catch(next);
    }

    //[DELETE] /likes/:id/force
    deleteForce(req, res, next) {
        Like.deleteOne({_id: req.params.id})
            .then(() => res.redirect('back'))
            .catch(next);
    }

}

module.exports = new LikeController();