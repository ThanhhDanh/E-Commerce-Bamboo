const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const likesController = require('../app/controllers/LikeController');
const validate = require('../app/middlewares/validateMiddleware');
const Like = require('../app/models/Likes');


// Hàm lấy danh sách 
const fetchLikes = async () => {
    const likes = await Like.find({}).lean();
    return { likes };
};

router.get('/create', likesController.create);
router.post('/store', [
    body('userId').notEmpty().withMessage("Tên người Like không được để trống"),
    body('productId').notEmpty().withMessage("Sản phẩm Like không được để trống"),
    validate('likes/create', fetchLikes)
], likesController.store);
router.delete('/:id/force', likesController.deleteForce);

module.exports = router;