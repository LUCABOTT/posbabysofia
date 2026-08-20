const express = require('express');

const router = express.Router();

const {
    crearVenta,
    listarVentas,
    obtenerVenta
} = require('../controllers/venta.controller');

const authMiddleware = require('../middleware/auth.middleware');


// Crear venta
router.post(
    '/',
    authMiddleware,
    crearVenta
);


router.get(
    '/',
    authMiddleware,
    listarVentas
);


router.get(
    '/:id',
    authMiddleware,
    obtenerVenta
);



module.exports = router;