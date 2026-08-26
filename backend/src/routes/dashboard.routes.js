const express = require('express');

const router = express.Router();

const {
    obtenerDashboard
} = require('../controllers/dashboard.controller');

const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, obtenerDashboard);

module.exports = router;
