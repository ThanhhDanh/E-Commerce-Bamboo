module.exports = function (req, res, next) {
    const publicRoutes = ['/', '/login', '/register', '/create', '/webhook/chat']; // Các route không yêu cầu đăng nhập

    if (!req.session.user && !publicRoutes.includes(req.path)) {
        return res.redirect('/'); // Chỉ redirect nếu không ở trang login
    }

    res.locals.user = req.session.user || null; // Lưu user để hiển thị trên giao diện
    next();
};
