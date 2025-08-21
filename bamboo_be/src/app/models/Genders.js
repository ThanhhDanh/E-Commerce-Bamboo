const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const Gender = new Schema(
{
    _id: { type: Number },
    name: { type: String, required: true },
}, {
    _id: false,
    timestamps: true,
});


Gender.plugin(AutoIncrement, { id: 'gender_id', inc_field: '_id' });
Gender.plugin(mongooseDelete, { 
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Gender', Gender);