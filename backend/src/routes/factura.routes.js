const express = require('express');

const router = express.Router();

const {
    listarFacturas,
    obtenerFactura,
    buscarFacturaPorNumero,
    obtenerFacturaParaImpresion
} = require('../controllers/factura.controller');

const authMiddleware = require('../middleware/auth.middleware');


// ==============================
// LISTAR FACTURAS
// ==============================

router.get(
    '/',
    authMiddleware,
    listarFacturas
);


// ==============================
// BUSCAR FACTURA POR NÚMERO
// ==============================

router.get(
    '/numero/:numero',
    authMiddleware,
    buscarFacturaPorNumero
);


// ==============================
// OBTENER FACTURA POR ID
// ==============================

router.get(
    '/:id/impresion',
    authMiddleware,
    obtenerFacturaParaImpresion
);


router.get(
    '/:id',
    authMiddleware,
    obtenerFactura
);




module.exports = router;