const { now } = require('mongoose');
const { mongodbToObject, mutipleMongooseToObject } = require('../../util/mongoose');
const Discount = require('../models/Discounts');

class DiscountController {
    //API Frontend
    //[GET] /discounts

    //[GET] /discounts/create
    create(req, res, next) {
        Discount.find({})
            .then((discounts) => {
                res.render('discounts/create', {
                    discounts: mutipleMongooseToObject(discounts),
                });
            })
            .catch(next);
    }

    //[POST] /discounts/create
    store(req, res, next) {
        const newDate = new Date();

        req.body.expirateTime = new Date(newDate.setMonth(newDate.getMonth() + 1));
        const discount = new Discount(req.body);
        discount
            .save()
            .then(() => res.redirect('/discounts/create'))
            .catch(next);
    }

    //[DELETE] /discounts/:id/force
    deleteForce(req, res, next) {
        Discount.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
}

module.exports = new DiscountController();
