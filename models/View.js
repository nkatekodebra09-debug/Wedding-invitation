const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({

    ip: { type: String },

    page: { type: String },

    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('View', viewSchema);
