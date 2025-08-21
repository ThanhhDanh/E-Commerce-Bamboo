const Shop = require('../models/Shops');
const Category = require('../models/Categories');
const User = require('../models/Users');
const Product = require('../models/Products');
const { mongodbToObject, mutipleMongooseToObject } = require('../../util/mongoose');

class ShopController {
    // [GET] /shops/create
    create(req, res, next) {
        Promise.all([Category.find({}), User.find({ role: 'seller' })])
            .then(([categories, users]) => {
                res.render('shops/create', {
                    users: mutipleMongooseToObject(users),
                    categories: mutipleMongooseToObject(categories),
                });
            })
            .catch(next);
    }

    // [POST] /shops/store
    store(req, res, next) {
        try {
            // Nếu có file upload, thêm đường dẫn ảnh vào req.body
            if (req.file) {
                req.body.image = req.file.path;
            }

            if (!Array.isArray(req.body.categoryId)) {
                req.body.categoryId = [req.body.categoryId];
            }

            req.body.categoryId = req.body.categoryId.map((id) => Number(id));

            // Tạo mới cửa hàng
            const shop = new Shop(req.body);
            shop.save()
                .then(() => res.redirect('/me/stored/shops'))
                .catch(next);
        } catch (err) {
            next(err);
        }
    }

    // [GET] /shops/:id/edit
    edit(req, res, next) {
        Shop.findById(req.params.id)
            .then((shop) =>
                res.render('shops/edit', {
                    shop: mongodbToObject(shop),
                }),
            )
            .catch(next);
    }

    //[PUT] /shops/:id
    update(req, res, next) {
        try {
            // Lọc dữ liệu từ req.body
            const updateFields = {
                ...req.body, // Các trường khác từ form
            };

            // Nếu có file upload, thêm thông tin đường dẫn file vào updateFields
            if (req.file) {
                updateFields.image = `/uploads/${req.file.filename}`;
            }

            // Cập nhật dữ liệu sản phẩm trong MongoDB
            Shop.updateOne({ _id: req.params.id }, updateFields)
                .then(() => res.redirect('/me/stored/shops'))
                .catch(next);
        } catch (err) {
            next(err);
        }
    }

    //[DELETE] /shops/:id
    delete(req, res, next) {
        Shop.delete({ _id: req.params.id })
            .then(() => {
                return Product.delete({ shopId: req.params.id }); // Xóa mềm tất cả sản phẩm của cửa hàng
            })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    //[DELETE] /shops/:id/force
    deleteForce(req, res, next) {
        Product.deleteMany({ shopId: req.params.id }) // Xóa toàn bộ sản phẩm trước
            .then(() => {
                return Shop.deleteOne({ _id: req.params.id }); // Sau đó xóa cửa hàng
            })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    //[PATCH] /shops/:id/restore
    restore(req, res, next) {
        Shop.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    //[POST] /shops/handle-form-actions
    handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                Shop.delete({ _id: { $in: req.body.shopIds } })
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({ message: 'Action is invalid!' });
        }
    }
}

module.exports = new ShopController();
