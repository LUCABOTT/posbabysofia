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
const roleMiddleware = require('../middleware/role.middleware');

const adminOnly = roleMiddleware('SUPER_ADMIN', 'ADMIN');


// Abrir caja
router.post(
    '/abrir',
    authMiddleware,
    adminOnly,
    abrirCaja
);


// Consultar caja abierta
router.get(
    '/actual',
    authMiddleware,
    adminOnly,
    obtenerCajaActual
);

// Registrar movimiento manual
router.post(
    '/movimiento',
    authMiddleware,
    adminOnly,
    registrarMovimiento
);

router.post(
    '/cerrar',
    authMiddleware,
    adminOnly,
    cerrarCaja
    );

router.get(
    '/historial',
    authMiddleware,
    adminOnly,
     historialCajas
    );

router.get(
    '/:id',
    authMiddleware,
    adminOnly,
    obtenerCajaPorId
);

module.exports = router;
