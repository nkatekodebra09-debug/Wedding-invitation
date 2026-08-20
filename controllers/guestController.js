const Guest = require('../models/Guest.js');

const submitRSVP = async (req, res) => {
    try {
        const { name, email, attending, message } = req.body;

        const guest = await Guest.create({ name, email, attending, message });

        res.json({
            message: 'RSVP received!!',
            guest
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save RSVP' });
    }
};

module.exports = { submitRSVP };

