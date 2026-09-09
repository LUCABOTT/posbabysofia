const express = require('express');

const router = express.Router();

const {
    crearConfiguracionFiscal,
    obtenerConfiguracionFiscal,
    actualizarConfiguracionFiscal
} = require('../controllers/configuracionFiscalController');


// ==============================
// CONFIGURACIÓN FISCAL
// ==============================

router.post(
    '/',
    crearConfiguracionFiscal
);


router.get(
    '/',
    obtenerConfiguracionFiscal
);


router.put(
    '/:id',
    actualizarConfiguracionFiscal
);


module.exports = router;