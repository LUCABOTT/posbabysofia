
'use strict';

const express = require('express');

const router = express.Router();

const {
    listarCumpleanosPendientes,
    listarTodosCumpleanos,
    obtenerCumpleanos,
    ignorarCumpleanos,
    enviarCorreoCumpleanos,
    probarCumpleanos
} = require('../controllers/cumpleanos.controller');

const authMiddleware =
    require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const adminOnly = roleMiddleware('SUPER_ADMIN', 'ADMIN');


// ============================================
// PROBAR PROCESO DE CUMPLEAÑOS
// TEMPORAL - SOLO PARA PRUEBAS
// ============================================

router.get(
    '/probar',
    authMiddleware,
    adminOnly,
    probarCumpleanos
);


// ============================================
// LISTAR PENDIENTES
// ============================================

router.get(
    '/',
    authMiddleware,
    adminOnly,
    listarCumpleanosPendientes
);

router.get(
    '/todos',
    authMiddleware,
    adminOnly,
    listarTodosCumpleanos
);


// ============================================
// OBTENER UNA NOTIFICACIÓN
// ============================================

router.get(
    '/:id',
    authMiddleware,
    adminOnly,
    obtenerCumpleanos
);


// ============================================
// ENVIAR CORREO
// ============================================

router.post(
    '/:id/enviar',
    authMiddleware,
    adminOnly,
    enviarCorreoCumpleanos
);


// ============================================
// IGNORAR
// ============================================

router.patch(
    '/:id/ignorar',
    authMiddleware,
    adminOnly,
    ignorarCumpleanos
);


module.exports = router;

