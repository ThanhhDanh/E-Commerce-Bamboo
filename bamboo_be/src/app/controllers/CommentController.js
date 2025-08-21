const Product = require('../models/Products');
const User = require('../models/Users');
const Comment = require('../models/Comments');
const { mongodbToObject, mutipleMongooseToObject } = require('../../util/mongoose');

class CommentController {
    //[GET] /comments/create
    create(req, res, next) {
        Promise.all([
            Product.find({}),
            User.find({}),
            Comment.find({}).sort({ createdAt: 1 }),
            Comment.countDocumentsWithDeleted({ deleted: true }),
        ])
            .then(([products, users, comments, deletedCount]) => {
                res.render('comments/create', {
                    deletedCount,
                    products: mutipleMongooseToObject(products),
                    users: mutipleMongooseToObject(users),
                    comments: mutipleMongooseToObject(comments),
                });
            })
            .catch(next);
    }

    //[POST] /comments/store
    async store(req, res, next) {
        try {
            const { content, productId, userId, role = 'user', parentId } = req.body;

            let rootId = null;

            if (parentId) {
                const parent = await Comment.findById(parentId);
                rootId = parent?.rootId || parent?._id;
            }

            const newComment = new Comment({
                content,
                productId,
                userId,
                role,
                parentId: parentId || null,
                rootId,
            });

            await newComment.save();

            // Nếu là bình luận gốc => rootId là chính nó
            if (!parentId) {
                await Comment.updateOne({ _id: newComment._id }, { rootId: newComment._id });
            }

            res.redirect('/comments/create');
        } catch (err) {
            next(err);
        }
    }

    //[POST] /comments/reply
    async reply(req, res, next) {
        try {
            const { content, productId, parentId } = req.body;
            const userId = req.user._id;
            const role = req.user.role || 'staff';

            // Lấy bình luận cha để lấy rootId
            const parentComment = await Comment.findById(parentId);
            const rootId = parentComment.rootId || parentComment._id;

            const reply = new Comment({
                content,
                productId,
                userId,
                role,
                parentId,
                rootId,
            });

            await reply.save();
            res.redirect('/products/' + productId);
        } catch (err) {
            next(err);
        }
    }

    //[DELETE] /comments/:id
    async delete(req, res, next) {
        try {
            await Comment.delete({ _id: req.params.id });
            res.redirect('back');
        } catch (err) {
            next(err);
        }
    }

    //[DELETE] /comments/:id/force
    async deleteForce(req, res, next) {
        try {
            await Comment.deleteOne({ _id: req.params.id });
            res.redirect('back');
        } catch (err) {
            next(err);
        }
    }

    //[PATCH] /comments/:id/restore
    async restore(req, res, next) {
        try {
            await Comment.restore({ _id: req.params.id });
            res.redirect('back');
        } catch (err) {
            next(err);
        }
    }

    //[GET] /trash/comments
    async trashComment(req, res, next) {
        try {
            const comments = await Comment.findWithDeleted({ deleted: true });
            res.render('comments/trash-comments', {
                comments: mutipleMongooseToObject(comments),
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CommentController();
