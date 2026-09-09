const express = require('express');

const router = express.Router();

const {
    obtenerDashboard
} = require('../controllers/dashboard.controller');

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.get(
    '/',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN', 'ADMIN'),
    obtenerDashboard
);

module.exports = router;
