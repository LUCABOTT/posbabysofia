const express = require('express');

const router = express.Router();

const {
    crearCliente,
    listarClientes,
    obtenerCliente,
    actualizarCliente,
    desactivarCliente
} = require('../controllers/cliente.controller');

const authMiddleware = require('../middleware/auth.middleware');


// Listar
router.get(
    '/',
    authMiddleware,
    listarClientes
);


// Obtener uno
router.get(
    '/:id',
    authMiddleware,
    obtenerCliente
);


// Crear
router.post(
    '/',
    authMiddleware,
    crearCliente
);


// Actualizar
router.put(
    '/:id',
    authMiddleware,
    actualizarCliente
);


// Desactivar
router.patch(
    '/:id/desactivar',
    authMiddleware,
    desactivarCliente
);


module.exports = router;