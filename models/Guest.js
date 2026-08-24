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

    attendeeCount: {
        type: Number,
        min: 1,
        max: 6,
        default: 1,
        required: true,
    },

    inviteeToken: {
        type: String,
        index: true,
    },

    timestamp: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('Guest', guestSchema);
