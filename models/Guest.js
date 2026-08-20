const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },

    attending: {
        type: Boolean,
        required: true,
    },

    message: {
        type: String,
    },

    timestamp: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('Guest', guestSchema);
