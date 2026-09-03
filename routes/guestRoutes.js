const express = require('express');
const { submitRSVP, getInviteeByToken } = require('../controllers/guestController.js');

const router = express.Router();
router.post('/rsvp', submitRSVP);
router.get('/invitee/:token', getInviteeByToken);

module.exports = router;
