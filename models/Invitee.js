const mongoose = require('mongoose');

const inviteeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    rsvpSubmitted: {
        type: Boolean,
        default: false,
    },
    submittedAt: {
        type: Date,
    },
});

inviteeSchema.index({ email: 1 });

module.exports = mongoose.model('Invitee', inviteeSchema);
