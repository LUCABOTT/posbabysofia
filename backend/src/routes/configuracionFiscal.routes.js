const express = require('express');

const router = express.Router();

const {
    crearConfiguracionFiscal,
    obtenerConfiguracionFiscal
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


module.exports = router;