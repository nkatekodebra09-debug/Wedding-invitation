const Guest = require('../models/Guest.js');
const Invitee = require('../models/Invitee.js');
const { getInviteeAccessToken } = require('../middleware/inviteAccess.js');

const submitRSVP = async (req, res) => {
    try {
        const { token, name, email, attending, attendeeCount, message } = req.body;

        const accessToken = getInviteeAccessToken(req);
        if (!accessToken) {
            return res.status(401).json({ error: 'A private invitation link is required.' });
        }
        if (token && token !== accessToken) {
            return res.status(403).json({ error: 'This invitation link is not valid.' });
        }

        const invitee = await Invitee.findOne({ token: accessToken });
        if (!invitee) {
            return res.status(403).json({ error: 'This invitation link is not valid.' });
        }
        if (invitee.rsvpSubmitted) {
            return res.status(409).json({ error: 'This invitation has already been used.' });
        }

        const count = Number(attendeeCount);
        if (!Number.isInteger(count) || count < 1 || count > 6) {
            return res.status(400).json({ error: 'attendeeCount must be an integer between 1 and 6.' });
        }

        const guest = await Guest.create({
            name,
            email,
            attending,
            message,
            attendeeCount: count,
            inviteeToken: accessToken,
            timestamp: Date.now(),
        });

        if (invitee) {
            invitee.rsvpSubmitted = true;
            invitee.submittedAt = new Date();
            await invitee.save();
        }

        res.json({
            message: 'RSVP received',
            guest,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save RSVP' });
    }
};

const sendInvitee = async (req, res, token) => {
    try {
        const accessToken = getInviteeAccessToken(req);
        if (!accessToken || (token && token !== accessToken)) {
            return res.status(403).json({ error: 'This invitation link is not valid.' });
        }
        const invitee = await Invitee.findOne({ token: accessToken });
        if (!invitee) {
            return res.status(404).json({ error: 'Invalid invitation token.' });
        }
        if (invitee.rsvpSubmitted) {
            return res.json({ alreadySubmitted: true });
        }
        res.json({
            name: invitee.name,
            email: invitee.email,
            alreadySubmitted: false,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invitee' });
    }
};

const getInviteeByToken = (req, res) => sendInvitee(req, res, req.params.token);
const getInviteeSession = (req, res) => sendInvitee(req, res);

module.exports = { submitRSVP, getInviteeByToken, getInviteeSession };
