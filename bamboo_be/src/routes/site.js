const express = require('express');
const router = express.Router();
const siteController = require('../app/controllers/SiteController');
const userController = require('../app/controllers/UserController');
const { upload } = require('../config/cloudinary/index');
const authMiddleware = require('../app/middlewares/authMiddleware');

router.get('/home', authMiddleware, siteController.home);
router.get('/search', siteController.search);
router.get('/register', userController.register);
router.get('/login', userController.login);
router.post('/login', userController.postLogin);
router.post('/create', upload.single('avatar'), userController.postRegister);
router.get('/logout', userController.logout);
router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/home');
    }
    return res.redirect('/login');
});

module.exports = router;
