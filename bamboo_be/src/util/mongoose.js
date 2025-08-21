module.exports = {
    mutipleMongooseToObject: function(mongooseArray) {
        return mongooseArray.map(mongoose => mongoose.toObject());
    },

    mongodbToObject: function(mongoose) {
        return mongoose  ? mongoose.toObject() : mongoose;
    }
};
