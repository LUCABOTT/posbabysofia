const {
    ConfiguracionFiscal
} = require('../models');


// ==============================
// CREAR CONFIGURACIÓN FISCAL
// ==============================

const crearConfiguracionFiscal = async (req, res) => {

    try {

        const {
            cai,
            rtn,
            razon_social,
            nombre_comercial,
            direccion,
            telefono,
            fecha_limite_emision,
            prefijo_factura,
            rango_inicial,
            rango_final,
            siguiente_numero,
            activo
        } = req.body;


        // ==============================
        // VALIDACIONES OBLIGATORIAS
        // ==============================

        if (
            !cai ||
            !rtn ||
            !razon_social ||
            !fecha_limite_emision ||
            !prefijo_factura ||
            rango_inicial === undefined ||
            rango_final === undefined
        ) {

            return res.status(400).json({
                message: 'Faltan datos obligatorios'
            });

        }


        // ==============================
        // VALIDAR PREFIJO
        // ==============================

        const prefijo = prefijo_factura.trim();

        const formatoPrefijo = /^\d{3}-\d{3}-\d{2}$/;

        if (!formatoPrefijo.test(prefijo)) {

            return res.status(400).json({
                message:
                    'El prefijo de factura debe tener el formato 000-001-01'
            });

        }


        // ==============================
        // CONVERTIR RANGOS
        // ==============================

        const inicio = Number(rango_inicial);
        const fin = Number(rango_final);

        const siguiente =
            siguiente_numero !== undefined
                ? Number(siguiente_numero)
                : inicio;


        // ==============================
        // VALIDAR NÚMEROS
        // ==============================

        if (
            !Number.isInteger(inicio) ||
            !Number.isInteger(fin) ||
            !Number.isInteger(siguiente)
        ) {

            return res.status(400).json({
                message:
                    'Los rangos y el siguiente número deben ser enteros'
            });

        }


        // ==============================
        // VALIDAR RANGOS POSITIVOS
        // ==============================

        if (
            inicio <= 0 ||
            fin <= 0
        ) {

            return res.status(400).json({
                message:
                    'Los rangos deben ser mayores que 0'
            });

        }


        // ==============================
        // VALIDAR RANGO
        // ==============================

        if (inicio > fin) {

            return res.status(400).json({
                message:
                    'El rango inicial no puede ser mayor que el rango final'
            });

        }


        // ==============================
        // VALIDAR SIGUIENTE NÚMERO
        // ==============================

        if (
            siguiente < inicio ||
            siguiente > fin
        ) {

            return res.status(400).json({
                message:
                    'El siguiente número debe estar dentro del rango autorizado'
            });

        }


        // ==============================
        // VERIFICAR CAI EXISTENTE
        // ==============================

        const existe =
            await ConfiguracionFiscal.findOne({
                where: {
                    cai: cai.trim()
                }
            });


        if (existe) {

            return res.status(400).json({
                message:
                    'Ya existe una configuración fiscal con este CAI'
            });

        }


        // ==============================
        // CREAR CONFIGURACIÓN
        // ==============================

        const configuracion =
            await ConfiguracionFiscal.create({

                cai: cai.trim(),

                rtn: rtn.trim(),

                razon_social:
                    razon_social.trim(),

                nombre_comercial:
                    nombre_comercial
                        ? nombre_comercial.trim()
                        : null,

                direccion:
                    direccion
                        ? direccion.trim()
                        : null,

                telefono:
                    telefono
                        ? telefono.trim()
                        : null,

                fecha_limite_emision,

                prefijo_factura: prefijo,

                rango_inicial: inicio,

                rango_final: fin,

                siguiente_numero: siguiente,

                activo:
                    activo !== undefined
                        ? Boolean(activo)
                        : true

            });


        // ==============================
        // RESPUESTA
        // ==============================

        return res.status(201).json({

            message:
                'Configuración fiscal creada correctamente',

            configuracion

        });


    } catch (error) {

        console.error(
            'Error al crear configuración fiscal:',
            error
        );

        return res.status(500).json({
            message:
                'Error interno del servidor'
        });

    }

};


// ==============================
// OBTENER CONFIGURACIÓN ACTIVA
// ==============================

const obtenerConfiguracionFiscal = async (req, res) => {

    try {

        const configuracion =
            await ConfiguracionFiscal.findOne({

                where: {
                    activo: true
                },

                order: [
                    ['id', 'DESC']
                ]

            });


        if (!configuracion) {

            return res.status(404).json({
                message:
                    'No existe una configuración fiscal activa'
            });

        }


        return res.json(configuracion);


    } catch (error) {

        console.error(
            'Error al obtener configuración fiscal:',
            error
        );

        return res.status(500).json({
            message:
                'Error interno del servidor'
        });

    }

};


module.exports = {

    crearConfiguracionFiscal,
    obtenerConfiguracionFiscal

};