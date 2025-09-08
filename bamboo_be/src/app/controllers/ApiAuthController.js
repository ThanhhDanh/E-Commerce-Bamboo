const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const { generateAccessToken, generateRefreshToken } = require('../../util/token');
const { storeRefreshToken, revokeRefreshToken, hasRefreshToken } = require('../../util/tokenStore');

const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // bật khi HTTPS
    path: '/',
    // domain: process.env.COOKIE_DOMAIN, // nếu cần chia sẻ domain
};

class ApiAuthController {
    // POST /api/auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ success: false, message: 'Email không tồn tại' });

            // (Tuỳ nhu cầu) Không giới hạn role ở API client
            // Nếu muốn chặn user không phải khách, có thể check role ở đây.

            const ok = await bcrypt.compare(password, user.password);
            if (!ok) return res.status(400).json({ success: false, message: 'Mật khẩu không đúng' });

            const payload = { userId: user._id.toString(), role: user.role, email: user.email };
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken({ userId: user._id.toString() });

            // Lưu refresh token (whitelist) để còn revoke khi logout
            storeRefreshToken(refreshToken);

            res.cookie('refreshToken', refreshToken, cookieOpts);

            return res.json({
                success: true,
                message: 'Đăng nhập thành công',
                accessToken,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                },
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Lỗi đăng nhập', error: err.message });
        }
    }

    // POST /api/auth/refresh
    async refresh(req, res) {
        try {
            const token = req.cookies?.refreshToken;
            if (!token) return res.status(401).json({ success: false, message: 'Thiếu refresh token' });

            // Kiểm tra có nằm trong whitelist không
            const exists = await Promise.resolve(hasRefreshToken(token));
            if (!exists) return res.status(401).json({ success: false, message: 'Refresh token không hợp lệ' });

            jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) return res.status(403).json({ success: false, message: 'Refresh token hết hạn hoặc sai' });

                const accessToken = generateAccessToken({ userId: payload.userId });
                // (Khuyến nghị) Rotate refresh token:
                const newRefreshToken = generateRefreshToken({ userId: payload.userId });

                // Thu hồi token cũ, lưu token mới
                revokeRefreshToken(token);
                storeRefreshToken(newRefreshToken);

                // Set cookie mới
                res.cookie('refreshToken', newRefreshToken, cookieOpts);

                return res.json({ success: true, accessToken });
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Lỗi refresh', error: err.message });
        }
    }

    // POST /api/auth/logout
    async logout(req, res) {
        try {
            const token = req.cookies?.refreshToken;
            if (token) {
                revokeRefreshToken(token);
            }
            res.clearCookie('refreshToken', { path: '/', sameSite: 'lax' });
            return res.json({ success: true, message: 'Đăng xuất thành công' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Lỗi đăng xuất', error: err.message });
        }
    }

    // GET /api/auth/me  (yêu cầu access token)
    async me(req, res) {
        try {
            const user = await User.findById(req.user.userId).select('-password');
            if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
            res.json({ success: true, user });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Lỗi lấy thông tin', error: err.message });
        }
    }
}

module.exports = new ApiAuthController();
