const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const commentsController = require('../app/controllers/CommentController');
const validate = require('../app/middlewares/validateMiddleware');
const Comment = require('../app/models/Comments');


// Hàm lấy danh sách bình luận
const fetchComments = async () => {
    const comments = await Comment.find({}).lean();
    return { comments };
};

router.get('/create', commentsController.create);
router.post('/store', [
    body('userId').notEmpty().withMessage("Người bình luận không được để trống"),
    body('productId').notEmpty().withMessage("Sản phẩm được bình luận không được để trống"),
    validate('comments/create', fetchComments)
], commentsController.store);
router.delete('/:id', commentsController.delete);
router.delete('/:id/force', commentsController.deleteForce);
router.patch('/:id/restore', commentsController.restore);
router.get('/trash/comment', commentsController.trashComment);

module.exports = router;