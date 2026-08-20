const View = require('../models/View.js');

const logView = async (req, res) => {
    try {
        await View.create({ ip: req.ip, page: req.body.page });
        res.json({ message: 'View logged.' });
    } 
    catch (error) {
        res.status(500).json({ error: 'Failed to log view' });
    }
};

module.exports = { logView };
