let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let barSchema = new Schema({
    zipCode: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    mobile_url: {
        type: String,
        required: true
    },
    users: {
        type: Array
    }
});

let model = mongoose.model('Bar', barSchema);

module.exports = model;