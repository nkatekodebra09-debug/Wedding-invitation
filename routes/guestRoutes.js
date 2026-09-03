const express = require('express');
const { submitRSVP, getInviteeByToken, getInviteeSession } = require('../controllers/guestController.js');

const router = express.Router();
router.post('/rsvp', submitRSVP);
router.get('/invitee/:token', getInviteeByToken);
router.get('/invitee', getInviteeSession);

module.exports = router;
