const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/buildings', authenticateToken, buildingController.getUserBuildings);
router.get('/all-buildings', authenticateToken, buildingController.getAllBuildings);
router.post('/build-power-plant', authenticateToken, buildingController.buildPowerPlant);
router.post('/update-production', authenticateToken, buildingController.updateProduction);

module.exports = router;