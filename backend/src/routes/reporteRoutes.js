
const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();
const adminOnly = roleMiddleware('SUPER_ADMIN', 'ADMIN');

const {
    obtenerReporteVentas,
    obtenerReporteCajas
} = require('../controllers/reporteController');


// ==============================
// REPORTE DE VENTAS
// ==============================

router.get(
    '/ventas',
    authMiddleware,
    adminOnly,
    obtenerReporteVentas
);

router.get(
    '/cajas',
    authMiddleware,
    adminOnly,
    obtenerReporteCajas
);


module.exports = router;

