const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();
const adminOnly = roleMiddleware('SUPER_ADMIN', 'ADMIN');

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
    authMiddleware,
    adminOnly,
    crearConfiguracionFiscal
);


router.get(
    '/',
    authMiddleware,
    adminOnly,
    obtenerConfiguracionFiscal
);


router.put(
    '/:id',
    authMiddleware,
    adminOnly,
    actualizarConfiguracionFiscal
);


module.exports = router;