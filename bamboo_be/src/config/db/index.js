const mongoose = require('mongoose');

async function connect() {
    try {
        // await mongoose.connect('mongodb://127.0.0.1:27017/data_bamboo_dev');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected successfully');
    } catch (error) {
        console.log('Lỗi: ' + error.message);
    }
}

module.exports = { connect };
