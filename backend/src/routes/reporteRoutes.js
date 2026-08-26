
const express = require('express');

const router = express.Router();

const {
    obtenerReporteVentas,
    obtenerReporteCajas
} = require('../controllers/reporteController');


// ==============================
// REPORTE DE VENTAS
// ==============================

router.get(
    '/ventas',
    obtenerReporteVentas
);

router.get(
    '/cajas',
    obtenerReporteCajas
);


module.exports = router;

