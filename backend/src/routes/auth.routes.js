const express = require('express');
const router = express.Router();

const {
    login,
    logout,
    registrarUsuario,
    listarUsuarios,
    editarUsuario,
    cambiarEstadoUsuario
} = require('../controllers/auth.controller');

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Login
router.post('/login', login);
router.post('/logout', logout);
router.post(
    '/register',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN'),
    registrarUsuario
);

router.get(
    '/users',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN'),
    listarUsuarios
);

router.put(
    '/users/:id',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN'),
    editarUsuario
);

router.patch(
    '/users/:id/estado',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN'),
    cambiarEstadoUsuario
);

// Usuario autenticado
router.get('/me', authMiddleware, (req, res) => {
    res.json({
        message: 'Usuario autenticado',
        user: req.user
    });
});

// Prueba SUPER_ADMIN
router.get(
    '/superadmin-test',
    authMiddleware,
    roleMiddleware('SUPER_ADMIN'),
    (req, res) => {
        res.json({
            message: 'Tienes permisos de SUPER_ADMIN',
            user: req.user
        });
    }
);

// Prueba ADMIN y SUPER_ADMIN
router.get(
    '/admin-test',
    authMiddleware,
    roleMiddleware('ADMIN'),
    (req, res) => {
        res.json({
            message: 'Tienes permisos de administrador',
            user: req.user
        });
    }
);

module.exports = router;