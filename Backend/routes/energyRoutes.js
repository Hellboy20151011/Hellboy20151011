const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energyController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/energy', authenticateToken, energyController.getEnergy);

module.exports = router;