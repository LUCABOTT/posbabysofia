const express = require('express');

const router = express.Router();

const {
    crearMovimiento,
    listarMovimientos
} = require('../controllers/movimientoCaja.controller');

const authMiddleware = require('../middleware/auth.middleware');


// Crear ingreso / egreso
router.post(
    '/',
    authMiddleware,
    crearMovimiento
);


// Listar movimientos
router.get(
    '/',
    authMiddleware,
    listarMovimientos
);


module.exports = router;