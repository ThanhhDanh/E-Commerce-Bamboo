const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Comment = new Schema(
    {
        _id: { type: Number },

        // Nội dung bình luận
        content: { type: String, required: true },

        // Sản phẩm liên quan
        productId: { type: Number, ref: 'Product', required: true },

        // Người bình luận
        userId: { type: Number, ref: 'User', required: true },

        // Phân biệt khách hay nhân viên
        role: { type: String, enum: ['user', 'staff'], default: 'user' },

        // Bình luận cha (nếu là trả lời)
        parentId: { type: Number, ref: 'Comment', default: null },

        // Gốc của chuỗi hội thoại (giúp gom 1 thread)
        rootId: { type: Number, ref: 'Comment', default: null },
    },
    {
        _id: false,
        timestamps: true,
    },
);

// Plugin auto tăng ID
Comment.plugin(AutoIncrement, { id: 'comment_id', inc_field: '_id' });

// Plugin soft delete
Comment.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

// Index giúp truy vấn nhanh hơn
Comment.index({ productId: 1 });
Comment.index({ parentId: 1 });
Comment.index({ rootId: 1 });

module.exports = mongoose.model('Comment', Comment);
