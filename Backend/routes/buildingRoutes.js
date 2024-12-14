const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/buildings', authenticateToken, buildingController.getBuildings);

module.exports = router;