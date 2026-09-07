'use strict';

const {
    CumpleanosNotificacion,
    Cliente,
    Producto
} = require('../models');

const fs = require('fs');
const path = require('path');

const {
    procesarCumpleanos
} = require('../services/cumpleanos.service');

const {
    enviarCorreo
} = require('../services/email.service');


const probarCumpleanos = async (req, res) => {
    try {
        const resultado = await procesarCumpleanos();

        return res.json({
            message:
                'Proceso de cumpleaños ejecutado correctamente',
            resultado
        });
    } catch (error) {
        console.error(
            'Error al probar proceso de cumpleaños:',
            error
        );

        return res.status(500).json({
            message:
                'Error al ejecutar proceso de cumpleaños'
        });
    }
};



// LISTAR CUMPLEAÑOS PENDIENTES
const listarCumpleanosPendientes = async (req, res) => {
    try {
        const notificaciones =
            await CumpleanosNotificacion.findAll({
                where: {
                    estado: 'PENDIENTE'
                },
                include: [
                    {
                        model: Cliente,
                        as: 'cliente',
                        attributes: [
                            'id',
                            'nombre',
                            'email',
                            'telefono',
                            'fecha_nacimiento'
                        ]
                    }
                ],
                order: [
                    ['fecha_cumpleanos', 'ASC']
                ]
            });

        return res.json(notificaciones);

    } catch (error) {

        console.error(
            'Error al listar cumpleaños:',
            error
        );

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// OBTENER CUMPLEAÑOS
const obtenerCumpleanos = async (req, res) => {
    try {

        const notificacion =
            await CumpleanosNotificacion.findByPk(
                req.params.id,
                {
                    include: [
                        {
                            model: Cliente,
                            as: 'cliente',
                            attributes: [
                                'id',
                                'nombre',
                                'email',
                                'telefono',
                                'fecha_nacimiento'
                            ]
                        }
                    ]
                }
            );

        if (!notificacion) {
            return res.status(404).json({
                message:
                    'Notificación de cumpleaños no encontrada'
            });
        }

        return res.json(notificacion);

    } catch (error) {

        console.error(
            'Error al obtener cumpleaños:',
            error
        );

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// IGNORAR CUMPLEAÑOS
const ignorarCumpleanos = async (req, res) => {
    try {

        const notificacion =
            await CumpleanosNotificacion.findByPk(
                req.params.id
            );

        if (!notificacion) {
            return res.status(404).json({
                message: 'Notificación no encontrada'
            });
        }

        await notificacion.update({
            estado: 'IGNORADO'
        });

        return res.json({
            message:
                'Notificación ignorada correctamente'
        });

    } catch (error) {

        console.error(
            'Error al ignorar cumpleaños:',
            error
        );

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ENVIAR CORREO DE CUMPLEAÑOS
// ENVIAR CORREO DE CUMPLEAÑOS
const enviarCorreoCumpleanos = async (req, res) => {
    try {

        const {
            asunto,
            mensaje,
            productos = []
        } = req.body;


        // ==========================================
        // VALIDACIONES
        // ==========================================

        if (!asunto || !asunto.trim()) {
            return res.status(400).json({
                message:
                    'El asunto del correo es obligatorio'
            });
        }

        if (!mensaje || !mensaje.trim()) {
            return res.status(400).json({
                message:
                    'El mensaje del correo es obligatorio'
            });
        }


        // ==========================================
        // BUSCAR NOTIFICACIÓN
        // ==========================================

        const notificacion =
            await CumpleanosNotificacion.findByPk(
                req.params.id,
                {
                    include: [
                        {
                            model: Cliente,
                            as: 'cliente'
                        }
                    ]
                }
            );


        if (!notificacion) {
            return res.status(404).json({
                message:
                    'Notificación de cumpleaños no encontrada'
            });
        }


        // ==========================================
        // EVITAR REENVÍO
        // ==========================================

        if (
            notificacion.estado ===
            'CORREO_ENVIADO'
        ) {
            return res.status(409).json({
                message:
                    'El correo de este cumpleaños ya fue enviado'
            });
        }


        const cliente = notificacion.cliente;


        // ==========================================
        // VALIDAR CORREO
        // ==========================================

        if (!cliente.email) {
            return res.status(400).json({
                message:
                    'El cliente no tiene un correo electrónico registrado'
            });
        }


        // ==========================================
        // VALIDAR PRODUCTOS
        // ==========================================

        let productosBD = [];

        if (
            Array.isArray(productos) &&
            productos.length > 0
        ) {

            const idsProductos = productos
                .map(producto => Number(producto.id))
                .filter(id => Number.isInteger(id));


            if (idsProductos.length > 0) {

                productosBD =
                    await Producto.findAll({
                        where: {
                            id: idsProductos,
                            activo: true
                        },
                        attributes: [
                            'id',
                            'nombre',
                            'descripcion',
                            'precio_venta',
                            'imagen'
                        ]
                    });

            }
        }


        // ==========================================
        // ESCAPAR HTML
        // ==========================================

        const escaparHTML = (texto = '') => {
            return String(texto)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };


        // ==========================================
        // MENSAJE
        // ==========================================

        const mensajeHTML =
            escaparHTML(mensaje)
                .replace(/\n/g, '<br />');


        // ==========================================
        // PRODUCTOS HTML
        // ==========================================

        let productosHTML = '';
        const attachments = [];


        if (productosBD.length > 0) {

            const tarjetas = productosBD
                .map(producto => {

                    const precio =
                        Number(
                            producto.precio_venta || 0
                        ).toFixed(2);


                    let imagenHTML = '';

                    if (producto.imagen) {
                        const nombreArchivo = path.basename(producto.imagen);
                        const rutaImagen = path.join(
                            __dirname,
                            '..',
                            '..',
                            'uploads',
                            'productos',
                            nombreArchivo
                        );
                        const cid = `producto-${producto.id}@babysofia`;

                        if (fs.existsSync(rutaImagen)) {
                            attachments.push({
                                filename: nombreArchivo,
                                path: rutaImagen,
                                cid
                            });
                        }

                        imagenHTML = `
                            <img
                                src="cid:${cid}"
                                alt="${escaparHTML(producto.nombre)}"
                                style="
                                    width: 100%;
                                    height: 220px;
                                    object-fit: cover;
                                    border-radius: 12px 12px 0 0;
                                    display: block;
                                "
                            />
                        `;

                    } else {

                        imagenHTML = `
                            <div style="
                                width: 100%;
                                height: 220px;
                                background: #f3f4f6;
                                border-radius: 12px 12px 0 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: #9ca3af;
                                font-size: 40px;
                            ">
                                👗
                            </div>
                        `;
                    }


                    return `
                        <td style="
                            width: 50%;
                            padding: 8px;
                            vertical-align: top;
                        ">

                            <div style="
                                border: 1px solid #eeeeee;
                                border-radius: 12px;
                                overflow: hidden;
                                background: #ffffff;
                            ">

                                ${imagenHTML}

                                <div style="
                                    padding: 14px;
                                ">

                                    <div style="
                                        font-size: 16px;
                                        font-weight: bold;
                                        color: #333333;
                                        margin-bottom: 6px;
                                    ">
                                        ${escaparHTML(
                                            producto.nombre
                                        )}
                                    </div>

                                    <div style="
                                        font-size: 17px;
                                        font-weight: bold;
                                        color: #d889a8;
                                    ">
                                        L ${precio}
                                    </div>

                                </div>

                            </div>

                        </td>
                    `;
                });


            // Dividir tarjetas de 2 en 2
            const filas = [];

            for (
                let i = 0;
                i < tarjetas.length;
                i += 2
            ) {
                filas.push(`
                    <tr>
                        ${tarjetas
                            .slice(i, i + 2)
                            .join('')}
                    </tr>
                `);
            }


            productosHTML = `
                <div style="
                    margin-top: 30px;
                ">

                    <h2 style="
                        text-align: center;
                        color: #333333;
                        font-size: 20px;
                        margin-bottom: 15px;
                    ">
                        Algunas opciones para ti 💕
                    </h2>

                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <tbody>
                            ${filas.join('')}
                        </tbody>
                    </table>

                </div>
            `;
        }


        // ==========================================
        // HTML COMPLETO DEL CORREO
        // ==========================================

        const html = `
            <!DOCTYPE html>

            <html lang="es">

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

                <title>
                    ${escaparHTML(asunto)}
                </title>

            </head>

            <body style="
                margin: 0;
                padding: 0;
                background: #fdf7fa;
                font-family: Arial, Helvetica, sans-serif;
            ">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                >

                    <tr>

                        <td
                            align="center"
                            style="padding: 30px 15px;"
                        >

                            <table
                                width="600"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    max-width: 600px;
                                    width: 100%;
                                    background: #ffffff;
                                    border-radius: 18px;
                                    overflow: hidden;
                                "
                            >

                                <!-- ENCABEZADO -->

                                <tr>

                                    <td
                                        align="center"
                                        style="
                                            padding: 30px 20px;
                                            background: #f8dce8;
                                        "
                                    >

                                        <div style="
                                            font-size: 28px;
                                            font-weight: bold;
                                            color: #333333;
                                        ">
                                            Baby Sofia
                                        </div>

                                        <div style="
                                            margin-top: 8px;
                                            font-size: 15px;
                                            color: #666666;
                                        ">
                                            Un detalle especial para ti 💕
                                        </div>

                                    </td>

                                </tr>


                                <!-- CONTENIDO -->

                                <tr>

                                    <td
                                        style="
                                            padding: 35px 30px;
                                        "
                                    >

                                        <h1 style="
                                            margin-top: 0;
                                            text-align: center;
                                            color: #333333;
                                            font-size: 24px;
                                        ">
                                            ${escaparHTML(asunto)}
                                        </h1>


                                        <div style="
                                            margin-top: 25px;
                                            color: #555555;
                                            font-size: 15px;
                                            line-height: 1.7;
                                        ">
                                            ${mensajeHTML}
                                        </div>


                                        ${productosHTML}


                                    </td>

                                </tr>


                                <!-- PIE -->

                                <tr>

                                    <td
                                        align="center"
                                        style="
                                            padding: 20px;
                                            background: #fafafa;
                                            color: #999999;
                                            font-size: 12px;
                                        "
                                    >
                                        Baby Sofia
                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>

                </table>

            </body>

            </html>
        `;


        // ==========================================
        // ENVIAR CORREO
        // ==========================================

        await enviarCorreo({
            destinatario: cliente.email,
            asunto: asunto.trim(),
            html,
            attachments
        });


        // ==========================================
        // ACTUALIZAR NOTIFICACIÓN
        // ==========================================

        await notificacion.update({
            estado: 'CORREO_ENVIADO',
            fecha_envio: new Date()
        });


        return res.json({
            message:
                'Correo enviado correctamente',

            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.email
            },

            productosEnviados:
                productosBD.length
        });


    } catch (error) {

        console.error(
            'Error al enviar correo de cumpleaños:',
            error
        );

        return res.status(500).json({
            message:
                'No fue posible enviar el correo'
        });
    }
};


module.exports = {
    listarCumpleanosPendientes,
    obtenerCumpleanos,
    ignorarCumpleanos,
    enviarCorreoCumpleanos,
    probarCumpleanos
};