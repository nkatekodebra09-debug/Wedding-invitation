const Admin = require('../models/Admin.js');
const Guest = require('../models/Guest.js');
const View = require('../models/View.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
    try{
        const {username, password} = req.body;
        const admin = await Admin.findOne({username});

        if (!admin) return 
        res.status(400).json({error: 'Invalid credentials'});

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return 
        res.status(400).json({error: 'Invalid credentials'});

        const token = jwt.sign({id: admin._id}, process.env.JWT_SECRET, { expiresIn: '1h'});
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};

const getStats = async (req, res) => {
    try {
        const totalGuests = await Guest.countDocuments();
        const attendingGuests = await Guest.countDocuments({ attending: true });
        const totalViews = await View.countDocuments();

        res.json({
            totalGuests,
            attendingGuests,
            totalViews
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};

module.exports = { loginAdmin, getStats };