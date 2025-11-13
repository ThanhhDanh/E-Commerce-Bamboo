const Product = require('../models/Products');
const Gender = require('../models/Genders');
const User = require('../models/Users');
const Category = require('../models/Categories');
const Shop = require('../models/Shops');
const { mongodbToObject, mutipleMongooseToObject } = require('../../util/mongoose');
const fs = require('fs');
const Sizes = require('../models/Sizes');
const Colors = require('../models/Colors');
const Discounts = require('../models/Discounts');
const CampaignProducts = require('../models/CampaignProducts');

class ProductController {
    //API - Frontend
    //[GET] /product/:slug/detail
    detailProduct(req, res, next) {
        Product.findOne({ slug: req.params.slug })
            .then(async (product) => {
                const now = new Date();
                const campaigns = await CampaignProducts.find({
                    productId: { $in: product._id },
                }).populate({
                    path: 'campaignId',
                    match: {
                        startDate: { $lte: now },
                        endDate: { $gte: now },
                    },
                });
                const activeCampaigns = campaigns.filter((c) => c.campaignId);
                let salePrice = product.price;
                if (activeCampaigns.length > 0) {
                    salePrice = Math.min(...activeCampaigns.map((c) => c.salePrice));
                }

                res.json({
                    ...product.toObject(),
                    salePrice,
                    activeCampaigns,
                });
            })
            .catch(next);
    }

    //[GET] /colors
    indexColor(req, res, next) {
        Colors.find({})
            .then((colors) => {
                res.json(colors);
            })
            .catch(next);
    }

    //[GET] /genders
    indexGender(req, res, next) {
        Gender.find({})
            .then((genders) => {
                res.json(genders);
            })
            .catch(next);
    }

    //[GET] /sizes
    indexSize(req, res, next) {
        Sizes.find({})
            .then((sizes) => {
                res.json(sizes);
            })
            .catch(next);
    }

    // [GET] /products/:slug
    show(req, res, next) {
        Product.findOne({ slug: req.params.slug })
            .then((product) => {
                res.render('products/show', {
                    product: mongodbToObject(product),
                });
            })
            .catch(next);
    }

    // [GET] /products/create
    create(req, res, next) {
        Promise.all([
            Gender.find({}),
            Category.find({}),
            Discounts.find({}),
            Shop.find({}),
            User.find({ role: 'seller' }),
            Sizes.find({}),
            Colors.find({}),
        ])
            .then(([genders, categories, discounts, shops, users, sizes, colors]) => {
                res.render('products/create', {
                    users: mutipleMongooseToObject(users),
                    categories: mutipleMongooseToObject(categories),
                    discounts: mutipleMongooseToObject(discounts),
                    genders: mutipleMongooseToObject(genders),
                    shops: mutipleMongooseToObject(shops),
                    sizes: mutipleMongooseToObject(sizes),
                    colors: mutipleMongooseToObject(colors),

                    defaultUserId: users.length ? users[0]._id.toString() : null,
                    defaultShopId: shops.length ? shops[0]._id.toString() : null,
                });
            })
            .catch(next);
    }

    // [POST] /products/store
    async store(req, res, next) {
        try {
            if (req.file) {
                const imageUrl = req.file.path;
                req.body.image = imageUrl;
            } else {
                return res.status(400).json({ message: 'Ảnh sản phẩm không được để trống' });
            }
            req.body.isFeatured = Array.isArray(req.body.isFeatured)
                ? req.body.isFeatured.includes('true')
                : req.body.isFeatured === 'true';

            const product = new Product({
                ...req.body,
                sizeIds: req.body.sizeId || [],
                colorIds: req.body.colorId || [],
            });

            await product.save();
            res.redirect('/me/stored/products');
        } catch (error) {
            next(error);
        }
    }

    // [GET] /products/:id/edit
    edit(req, res, next) {
        Promise.all([Product.findById(req.params.id), Sizes.find({}), Colors.find({})])
            .then(([product, sizes, colors]) => {
                res.render('products/edit', {
                    product: mongodbToObject(product),
                    sizes: mutipleMongooseToObject(sizes),
                    colors: mutipleMongooseToObject(colors),
                });
            })
            .catch(next);
    }

    //[PUT] /products/:id
    update(req, res, next) {
        try {
            // Lọc dữ liệu từ req.body
            const updateFields = {
                ...req.body, // Các trường khác từ form
                sizeIds: req.body.sizeIds || [],
                colorIds: req.body.colorIds || [],
            };

            // Nếu có file upload, thêm thông tin đường dẫn file vào updateFields
            if (req.file) {
                updateFields.image = `/uploads/${req.file.filename}`;
            }

            updateFields.isFeatured = updateFields.isFeatured === 'true';

            // Cập nhật dữ liệu sản phẩm trong MongoDB
            Product.updateOne({ _id: req.params.id }, updateFields)
                .then(() => res.redirect('/me/stored/products'))
                .catch(next);
        } catch (err) {
            next(err);
        }
    }

    // update(req, res, next) {
    //     try {
    //         const updateFields = { ...req.body };

    //         // Nếu có file upload
    //         if (req.file) {
    //             updateFields.image = `/uploads/${req.file.filename}`; // Đường dẫn ảnh mới

    //             // Lấy thông tin sản phẩm hiện tại từ cơ sở dữ liệu
    //             Product.findById(req.params.id)
    //                 .then(product => {
    //                     if (product.image) {
    //                         // Đường dẫn đầy đủ đến ảnh cũ
    //                         const oldImagePath = path.join(__dirname, '..', 'public', product.image);

    //                         // Kiểm tra và xóa ảnh cũ
    //                         if (fs.existsSync(oldImagePath)) {
    //                             fs.unlinkSync(oldImagePath); // Xóa ảnh cũ
    //                         }
    //                     }

    //                     // Cập nhật dữ liệu sản phẩm với thông tin mới
    //                     return Product.updateOne({ _id: req.params.id }, updateFields);
    //                 })
    //                 .then(() => res.redirect('/me/stored/products'))
    //                 .catch(next);
    //         } else {
    //             // Nếu không có file upload, chỉ cập nhật các trường khác
    //             Product.updateOne({ _id: req.params.id }, updateFields)
    //                 .then(() => res.redirect('/me/stored/products'))
    //                 .catch(next);
    //         }
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    //[DELETE] /products/:id
    delete(req, res, next) {
        Product.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    //[DELETE] /products/:id/force
    deleteForce(req, res, next) {
        Product.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    //[PATCH] /products/:id/restore
    restore(req, res, next) {
        Product.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    //[POST] /products/handle-form-actions
    handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                Product.delete({ _id: { $in: req.body.productIds } })
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({ message: 'Action is invalid!' });
        }
    }

    // [GET] /products/gender/create
    genderCreate(req, res, next) {
        Gender.find({})
            .then((genders) => {
                res.render('products/genderCreate', {
                    genders: mutipleMongooseToObject(genders),
                });
            })
            .catch(next);
    }

    // [POST] /products/gender/store
    genderStore(req, res, next) {
        const gender = new Gender(req.body);
        gender
            .save()
            .then(() => res.redirect('/products/gender/create'))
            .catch(next);
    }

    // [GET] /products/gender/create (Hiện Show danh sách ở trang này)
    genderShow(req, res, next) {
        Gender.find({})
            .then((genders) => {
                res.render('products/genderCreate', {
                    genders: mutipleMongooseToObject(genders),
                });
            })
            .catch(next);
    }

    //[DELETE] /products/gender/:id/force
    deleteGenderForce(req, res, next) {
        Gender.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [GET] /products/size/create
    sizeCreate(req, res, next) {
        Sizes.find({})
            .then((sizes) => {
                res.render('products/sizeCreate', {
                    sizes: mutipleMongooseToObject(sizes),
                });
            })
            .catch(next);
    }

    // [POST] /products/size/store
    sizeStore(req, res, next) {
        const size = new Sizes(req.body);
        size.save()
            .then(() => res.redirect('/products/size/create'))
            .catch(next);
    }

    //[DELETE] /products/size/:id/force
    deleteSizeForce(req, res, next) {
        Sizes.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [GET] /products/color/create
    colorCreate(req, res, next) {
        Colors.find({})
            .then((colors) => {
                res.render('products/colorCreate', {
                    colors: mutipleMongooseToObject(colors),
                });
            })
            .catch(next);
    }

    // [POST] /products/color/store
    colorStore(req, res, next) {
        const color = new Colors(req.body);
        color
            .save()
            .then(() => res.redirect('/products/color/create'))
            .catch(next);
    }

    //[DELETE] /products/color/:id/force
    deleteColorForce(req, res, next) {
        Colors.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
}

module.exports = new ProductController();
