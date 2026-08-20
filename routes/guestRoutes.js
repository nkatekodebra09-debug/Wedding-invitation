const express = require('express')
const {submitRSVP} = require('../controllers/guestController.js');

const router = express.Router();
router.post('/rsvp', submitRSVP);

module.exports = router;