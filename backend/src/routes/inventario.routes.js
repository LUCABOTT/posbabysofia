const express = require('express');

const router = express.Router();

const {
    entradaInventario,
    salidaInventario,
    ajustarInventario,
    listarMovimientos,
    movimientosProducto
} = require('../controllers/inventario.controller');

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const adminOnly = roleMiddleware('SUPER_ADMIN', 'ADMIN');


// Ver movimientos
router.get(
    '/movimientos',
    authMiddleware,
    adminOnly,
    listarMovimientos
);


// Ver movimientos de un producto
router.get(
    '/producto/:id',
    authMiddleware,
    adminOnly,
    movimientosProducto
);


// Entrada
router.post(
    '/entrada',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN', 'ADMIN'),
    entradaInventario
);


// Salida
router.post(
    '/salida',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN', 'ADMIN'),
    salidaInventario
);


// Ajuste
router.post(
    '/ajuste',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN', 'ADMIN'),
    ajustarInventario
);


module.exports = router;