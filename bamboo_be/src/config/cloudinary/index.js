const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: 'dsyzahqsj',
    api_key: '696835852437271',
    api_secret: 'RZ_vLJDhgOkaNTEpQSNebIxd7SM',
});

// Cấu hình Multer Storage để upload trực tiếp lên Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        transformation: [{ width: 300, height: 300, crop: 'limit' }], // Giới hạn kích thước ảnh
        secure: true,
    },
});

const upload = multer({ storage });

module.exports = { upload, cloudinary };
