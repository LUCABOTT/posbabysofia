const express = require('express');

const router = express.Router();

const {
    crearMovimiento,
    listarMovimientos
} = require('../controllers/movimientoCaja.controller');

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const adminOnly = roleMiddleware('SUPER_ADMIN', 'ADMIN');


// Crear ingreso / egreso
router.post(
    '/',
    authMiddleware,
    adminOnly,
    crearMovimiento
);


// Listar movimientos
router.get(
    '/',
    authMiddleware,
    adminOnly,
    listarMovimientos
);


module.exports = router;