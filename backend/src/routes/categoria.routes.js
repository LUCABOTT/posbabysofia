const express = require('express');

const router = express.Router();

const {
    obtenerCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    eliminarCategoriaDefinitiva
} = require('../controllers/categoria.controller');

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const adminOnly = roleMiddleware('SUPER_ADMIN', 'ADMIN');

router.get(
    '/',
    authMiddleware,
    adminOnly,
    obtenerCategorias
);

router.get(
    '/:id',
    authMiddleware,
    adminOnly,
    obtenerCategoria
);

router.post(
    '/',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN', 'ADMIN'),
    crearCategoria
);

router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN', 'ADMIN'),
    actualizarCategoria
);

router.delete(
    '/definitivo/:id',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN'),
    eliminarCategoriaDefinitiva
);

router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN', 'ADMIN'),
    eliminarCategoria
);

module.exports = router;
