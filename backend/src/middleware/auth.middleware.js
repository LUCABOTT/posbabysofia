const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookies = Object.fromEntries(
            (req.headers.cookie || '').split(';').filter(Boolean).map((cookie) => {
                const [name, ...value] = cookie.trim().split('=');
                return [name, decodeURIComponent(value.join('='))];
            })
        );
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : cookies.posbabysofia_token;

        if (!token) {
            return res.status(401).json({
                message: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        console.error('Error de autenticación:', error.message);

        return res.status(401).json({
            message: 'Token inválido o expirado'
        });
    }
};

module.exports = authMiddleware;