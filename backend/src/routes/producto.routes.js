const express = require('express');

const router = express.Router();

const {
    listarProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    eliminarProductoDefinitivo
} = require('../controllers/producto.controller');

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

router.get(
    '/',
    authMiddleware,
    listarProductos
);


router.get(
    '/:id',
    authMiddleware,
    obtenerProducto
);



router.delete(
    '/definitivo/:id',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN'),
    eliminarProductoDefinitivo
);


router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN', 'ADMIN'),
    eliminarProducto
);


router.post(
    '/',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN', 'ADMIN'),
    upload.single('imagen'),
    crearProducto
);

router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN', 'ADMIN'),
    upload.single('imagen'),
    actualizarProducto
);


module.exports = router;
