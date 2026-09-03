const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const CARPETA_DESTINO = path.join(__dirname, '..', '..', 'uploads', 'productos');

// Crea la carpeta si no existe
if (!fs.existsSync(CARPETA_DESTINO)) {
    fs.mkdirSync(CARPETA_DESTINO, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, CARPETA_DESTINO);
    },
    filename: (req, file, cb) => {
        const nombreUnico = crypto.randomUUID();
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${nombreUnico}${extension}`);
    }
});

const filtroArchivo = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

    if (!tiposPermitidos.includes(file.mimetype)) {
        return cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter: filtroArchivo,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

module.exports = upload;