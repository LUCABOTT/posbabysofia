
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


// ============================================
// PROBAR PROCESO DE CUMPLEAÑOS
// TEMPORAL - SOLO PARA PRUEBAS
// ============================================

router.get(
    '/probar',
    authMiddleware,
    probarCumpleanos
);


// ============================================
// LISTAR PENDIENTES
// ============================================

router.get(
    '/',
    authMiddleware,
    listarCumpleanosPendientes
);

router.get(
    '/todos',
    authMiddleware,
    listarTodosCumpleanos
);


// ============================================
// OBTENER UNA NOTIFICACIÓN
// ============================================

router.get(
    '/:id',
    authMiddleware,
    obtenerCumpleanos
);


// ============================================
// ENVIAR CORREO
// ============================================

router.post(
    '/:id/enviar',
    authMiddleware,
    enviarCorreoCumpleanos
);


// ============================================
// IGNORAR
// ============================================

router.patch(
    '/:id/ignorar',
    authMiddleware,
    ignorarCumpleanos
);


module.exports = router;

