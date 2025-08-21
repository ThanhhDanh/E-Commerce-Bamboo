const { validationResult } = require('express-validator');

module.exports = function validate(template, fetchData = null) {
    return async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let extraData = {};
            
            // Nếu có hàm fetchData, gọi nó để lấy dữ liệu cần thiết
            if (fetchData) {
                try {
                    extraData = await fetchData();
                } catch (error) {
                    return next(error);
                }
            }

            return res.render(template, {
                errors: errors.mapped(), // Trả lỗi về view
                oldData: req.body, // Lưu lại dữ liệu đã nhập
                ...extraData // Truyền thêm dữ liệu nếu có
            });
        }
        next();
    };
};
