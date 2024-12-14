const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/resources', authenticateToken, resourceController.getResources);

module.exports = router;