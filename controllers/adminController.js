const Admin = require('../models/Admin.js');
const Guest = require('../models/Guest.js');
const Invitee = require('../models/Invitee.js');
const View = require('../models/View.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
    try {
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in the environment. Admin login will fail until it is configured.');
        }

        const username = (req.body?.username || '').trim();
        const password = (req.body?.password || '').trim();
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'Server is missing JWT_SECRET' });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

const getStats = async (req, res) => {
    try {
        const totalGuests = await Guest.countDocuments();
        const attendingGuests = await Guest.countDocuments({ attending: true });
        const totalViews = await View.countDocuments();

        const totalPeopleAgg = await Guest.aggregate([
            { $match: { attending: true } },
            { $group: { _id: null, total: { $sum: '$attendeeCount' } } },
        ]);
        const attendingTotalPeople = totalPeopleAgg[0]?.total ?? 0;

        res.json({
            totalGuests,
            attendingGuests,
            attendingTotalPeople,
            totalViews,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

const getRsvps = async (req, res) => {
    try {
        const guests = await Guest.find({}).sort({ timestamp: -1 }).lean();
        const rows = guests.map((g) => ({
            id: g._id,
            name: g.name,
            email: g.email,
            attending: g.attending,
            attendeeCount: g.attendeeCount,
            message: g.message || '',
            timestamp: g.timestamp,
        }));
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch RSVPs' });
    }
};

const getInvitees = async (req, res) => {
    try {
        const invitees = await Invitee.find({}).sort({ name: 1 }).lean();
        const rows = invitees.map((i) => ({
            id: i._id,
            name: i.name,
            email: i.email,
            rsvpSubmitted: i.rsvpSubmitted,
            submittedAt: i.submittedAt || null,
        }));
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invitees' });
    }
};

const getGuestList = async (req, res) => {
    try {
        const [invitees, guests] = await Promise.all([
            Invitee.find({}).sort({ name: 1 }).lean(),
            Guest.find({}).sort({ timestamp: -1 }).lean(),
        ]);

        const rsvpByToken = new Map();
        guests.forEach((g) => {
            if (g.inviteeToken) {
                rsvpByToken.set(g.inviteeToken, g);
            }
        });

        const inviteeRows = invitees.map((i) => {
            const rsvp = rsvpByToken.get(i.token);
            return {
                id: i._id,
                name: i.name,
                email: i.email,
                invited: true,
                rsvpSubmitted: i.rsvpSubmitted,
                attending: rsvp ? rsvp.attending : null,
                attendeeCount: rsvp ? rsvp.attendeeCount : null,
                message: rsvp ? rsvp.message || '' : '',
                submittedAt: i.submittedAt || null,
            };
        });

        const invitedEmails = new Set(invitees.map((i) => i.email.toLowerCase()));
        const walkInRows = guests
            .filter((g) => !g.inviteeToken && !invitedEmails.has(g.email.toLowerCase()))
            .map((g) => ({
                id: g._id,
                name: g.name,
                email: g.email,
                invited: false,
                rsvpSubmitted: true,
                attending: g.attending,
                attendeeCount: g.attendeeCount,
                message: g.message || '',
                submittedAt: g.timestamp,
            }));

        const stats = {
            totalInvited: invitees.length,
            totalResponded: invitees.filter((i) => i.rsvpSubmitted).length,
            totalAttending: guests.filter((g) => g.attending).length,
            totalDeclined: guests.filter((g) => g.attending === false).length,
            totalAttendees: guests
                .filter((g) => g.attending)
                .reduce((sum, g) => sum + (g.attendeeCount || 1), 0),
            walkIns: walkInRows.length,
        };

        res.json({ stats, invitees: inviteeRows, walkIns: walkInRows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch guest list' });
    }
};

module.exports = { loginAdmin, getStats, getRsvps, getInvitees, getGuestList };
