const { mongodbToObject, mutipleMongooseToObject } = require('../../util/mongoose');
const Product = require('../models/Products');
const User = require('../models/Users');
const Like = require('../models/Likes');
const { mergeCampaignPrice } = require('../../helpers/handlebars');

class LikeController {
    //API - Frontend
    //[GET] /likes/:userId/list
    async listLike(req, res, next) {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({ message: 'Bạn không thể lấy được danh sách sản phẩm bạn thích' });
            }

            const listLike = await Like.find({
                userId: userId,
                active: true,
            })
                .populate('productId')
                .populate('userId')
                .lean()
                .sort({ createdAt: -1 });

            if (!listLike) {
                return res.status(404).json({ message: 'Danh sách sản phẩm của bạn không tồn tại', data: [] });
            }

            const products = listLike.map((like) => like.productId);

            const mergeProducts = await mergeCampaignPrice(products);

            const result = listLike.map((like, index) => ({
                ...like,
                productId: mergeProducts[index],
            }));

            return res.status(200).json({
                message: 'Lấy danh sách yêu thích thành công',
                count: result.length,
                data: result,
            });
        } catch (error) {
            console.error('Lỗi listLike:', error);
            return res.status(500).json({
                message: 'Có lỗi khi lấy danh sách yêu thích',
                error: error.message,
            });
        }
    }

    // [POST] /api/likes/toggle
    async toggleLike(req, res) {
        try {
            const { userId, productId } = req.body;

            if (!userId || !productId) {
                return res.status(400).json({ message: 'Thiếu userId hoặc productId' });
            }

            let like = await Like.findOne({ userId, productId });

            if (like) {
                await Like.deleteOne({ _id: like._id });

                return res.status(200).json({
                    message: 'Đã bỏ thích sản phẩm',
                    action: 'unlike',
                    liked: false,
                });
            }

            like = new Like({
                userId,
                productId,
                active: true,
            });
            await like.save();

            return res.status(201).json({
                message: 'Đã thích sản phẩm',
                action: 'like',
                liked: true,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }

    // ---------------------------------------------------------------------------------------------------

    //[GET] /likes/create
    create(req, res, next) {
        Promise.all([Product.find({}), User.find({ role: 'user' }), Like.find({ active: 'true' })])
            .then(([products, users, likes]) => {
                res.render('likes/create', {
                    products: mutipleMongooseToObject(products),
                    users: mutipleMongooseToObject(users),
                    likes: mutipleMongooseToObject(likes),
                });
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
        Like.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
}

module.exports = new LikeController();
