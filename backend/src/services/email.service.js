'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

const enviarCorreo = async ({
    destinatario,
    asunto,
    html,
    attachments = []
}) => {

    if (!destinatario) {
        throw new Error(
            'El destinatario es obligatorio'
        );
    }

    if (!asunto) {
        throw new Error(
            'El asunto es obligatorio'
        );
    }

    if (!html) {
        throw new Error(
            'El contenido del correo es obligatorio'
        );
    }

    const resultado = await transporter.sendMail({
        from: `"Baby Sofia" <${process.env.SMTP_USER}>`,
        to: destinatario,
        subject: asunto,
        html,
        attachments
    });

    return resultado;
};

module.exports = {
    enviarCorreo
};