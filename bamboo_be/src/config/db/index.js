const mongoose = require('mongoose');

async function connect() {
    try {
        const uri =
            process.env.NODE_ENV === 'production' ? process.env.MONGO_URI : 'mongodb://127.0.0.1:27017/data_bamboo_dev';

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`Connected to MongoDB: ${uri}`);
    } catch (error) {
        console.log('Lỗi: ' + error.message);
    }
}

module.exports = { connect };
