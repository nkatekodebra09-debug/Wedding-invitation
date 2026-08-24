const express = require('express');
const { loginAdmin, getStats, getRsvps, getInvitees, getGuestList } = require('../controllers/adminController.js');
const auth = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/stats', auth, getStats);
router.get('/rsvps', auth, getRsvps);
router.get('/invitees', auth, getInvitees);
router.get('/guest-list', auth, getGuestList);

module.exports = router;
