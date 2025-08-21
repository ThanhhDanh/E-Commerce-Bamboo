const User = require('../models/Users');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const bcrypt = require('bcryptjs');

class UserController {
    // [GET] /login
    login(req, res, next) {
        if (req.session.user) {
            return res.redirect('/home'); // Nếu đã đăng nhập, chuyển hướng về trang chính
        }
        res.render('admin/login', { layout: 'auth' });
    }

    // [GET] /register
    register(req, res, next) {
        res.render('admin/register', { layout: 'auth' });
    }

    //[POST] /create
    async postRegister(req, res, next) {
        try {
            const { firstName, lastName, email, phone, password, address, avatar } = req.body;

            // Mã hóa mật khẩu trước khi lưu vào DB
            const hashedPassword = await bcrypt.hash(password, 10);

            // Lấy đường dẫn ảnh từ Cloudinary
            const avatarUrl = req.file ? req.file.path : '';

            const newUser = new User({
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
                address,
                avatar: avatarUrl,
                role: 'user',
            });

            console.log(newUser);

            const existedUser = await User.findOne({ email: newUser.email });

            if (existedUser) {
                res.json({ message: 'Email đã tồn tại. Bạn hãy đăng ký bằng email khác!!!' });
            } else {
                await newUser.save();
                res.redirect('/');
            }
        } catch (error) {
            res.status(500).json({ message: 'Lỗi đăng ký!', error });
        }
    }

    //[POST] /login
    async postLogin(req, res, next) {
        try {
            const user = await User.findOne({ email: req.body.email });

            if (!user) {
                return res.status(404).json({ message: 'Email không tồn tại!!!' });
            }

            // Kiểm tra role: chỉ cho phép admin hoặc employee
            if (user.role !== 'admin' && user.role !== 'employee') {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền đăng nhập vào hệ thống!' });
            }

            const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
            if (isPasswordMatch) {
                req.session.user = {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar,
                    address: user.address,
                    role: user.role,
                };
                return res.json({ success: true, message: 'Đăng nhập thành công!', user: req.session.user });
            } else {
                return res.status(400).json({ success: false, message: 'Mật khẩu nhập sai hoặc không tồn tại!!!' });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Lỗi đăng nhập!', error });
        }
    }

    // [GET] /logout
    async logout(req, res) {
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ message: 'Lỗi đăng xuất!' });

            // Xóa cookie session trên trình duyệt
            res.clearCookie('connect.sid', { path: '/' });

            // Chuyển hướng về trang login
            res.redirect('/');
        });
    }
}

module.exports = new UserController();
