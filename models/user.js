let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: Number,
        required: true
    }
});

let model = mongoose.model('User', userSchema);

module.exports = model;