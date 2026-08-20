const express = require('express');
const { logView } = require('../controllers/viewController.js');


const router = express.Router();

router.post('/view', logView);

module.exports = router;
