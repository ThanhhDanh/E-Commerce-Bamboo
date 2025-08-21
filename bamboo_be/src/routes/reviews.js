const express = require('express');
const { body } = require('express-validator');
const validate = require('../app/middlewares/validateMiddleware');
const router = express.Router();
const reviewsController = require('../app/controllers/ReviewController');
const Review = require('../app/models/Reviews');


// Hàm lấy danh sách danh mục
const fetchReviews = async () => {
    const reviews = await Review.find({}).lean();
    return { reviews };
};

router.get('/create', reviewsController.create);
router.post('/store',[
    body('rating').notEmpty().withMessage("Đánh giá sao không được để trống"),
    body('commentId').notEmpty().withMessage("Bình luận đánh giá không được để trống"),
    body('productId').notEmpty().withMessage("Sản phẩm đánh giá không được để trống"),
    body('userId').notEmpty().withMessage("Người đánh giá không được để trống"),
    validate('reviews/create', fetchReviews)
], reviewsController.store);
router.delete('/:id/force', reviewsController.deleteForce);

module.exports = router;