const express = require('express');

const router = express.Router();

const {
    abrirCaja,
    obtenerCajaActual,
    registrarMovimiento,
    cerrarCaja,
    historialCajas,
    obtenerCajaPorId,
} = require('../controllers/caja.controller');

const authMiddleware = require('../middleware/auth.middleware');


// Abrir caja
router.post(
    '/abrir',
    authMiddleware,
    abrirCaja
);


// Consultar caja abierta
router.get(
    '/actual',
    authMiddleware,
    obtenerCajaActual
);

// Registrar movimiento manual
router.post(
    '/movimiento',
    authMiddleware,
    registrarMovimiento
);

router.post(
    '/cerrar',
    authMiddleware,
    cerrarCaja
    );

router.get(
    '/historial',
    authMiddleware,
     historialCajas
    );

router.get(
    '/:id',
    authMiddleware,
    obtenerCajaPorId
);

module.exports = router;
