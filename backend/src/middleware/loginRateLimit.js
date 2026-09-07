'use strict';

const rateLimit = require('express-rate-limit');

const loginRateLimit = rateLimit({
    windowMs: 20 * 1000, // 20 segundos
    limit: 5,

    message: {
        message:
            'Demasiados intentos de inicio de sesión. Intenta nuevamente en 20 segundos.'
    },

    standardHeaders: true,
    legacyHeaders: false
});

module.exports = loginRateLimit;