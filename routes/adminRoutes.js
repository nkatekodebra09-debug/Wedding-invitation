const express = require('express');
const {loginAdmin, getStats} = require('../controllers/adminController.js')
const auth = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/stats', auth, getStats);

module.exports = router;