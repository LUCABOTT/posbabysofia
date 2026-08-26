const {
    sequelize,
    Venta,
    Pago,
    DetalleVenta,
    Producto,
    Caja
} = require('../models');

const { Op } = require('sequelize');


// ==============================
// REPORTE DE VENTAS
// ==============================

const obtenerReporteVentas = async (req, res) => {

    try {

        const { fecha_inicio, fecha_fin } = req.query;

        // ==============================
        // VALIDAR FECHAS
        // ==============================

        if (!fecha_inicio || !fecha_fin) {

            return res.status(400).json({
                message: 'Debe proporcionar fecha_inicio y fecha_fin'
            });

        }

        const inicio = new Date(`${fecha_inicio}T00:00:00.000`);
        const fin = new Date(`${fecha_fin}T23:59:59.999`);

        if (
            isNaN(inicio.getTime()) ||
            isNaN(fin.getTime())
        ) {

            return res.status(400).json({
                message: 'Las fechas proporcionadas no son válidas'
            });

        }

        if (inicio > fin) {

            return res.status(400).json({
                message: 'La fecha_inicio no puede ser mayor que fecha_fin'
            });

        }


        // ==============================
        // BUSCAR VENTAS
        // ==============================

        const ventas = await Venta.findAll({

            where: {

                created_at: {
                    [Op.between]: [inicio, fin]
                }

            },

            attributes: [
                'id',
                'numero',
                'cliente_id',
                'usuario_id',
                'subtotal',
                'descuento',
                'impuesto',
                'total',
                'estado',
                'created_at'
            ],

            order: [
                ['created_at', 'DESC']
            ]

        });


        // ==============================
        // SEPARAR VENTAS
        // ==============================

        const ventasCompletadas = ventas.filter(
            venta => venta.estado === 'COMPLETADA'
        );

        const ventasAnuladas = ventas.filter(
            venta => venta.estado === 'ANULADA'
        );


        // ==============================
        // TOTAL VENTAS
        // ==============================

        const totalVentas = ventasCompletadas.reduce(
            (total, venta) =>
                total + Number(venta.total),
            0
        );


        // ==============================
        // TOTAL DESCUENTOS
        // ==============================

        const totalDescuentos = ventasCompletadas.reduce(
            (total, venta) =>
                total + Number(venta.descuento),
            0
        );


        // ==============================
        // PAGOS
        // ==============================

        const pagos = await Pago.findAll({

            include: [

                {
                    model: Venta,
                    as: 'venta',
                    required: true,

                    attributes: [],

                    where: {

                        estado: 'COMPLETADA',

                        created_at: {
                            [Op.between]: [inicio, fin]
                        }

                    }

                }

            ]

        });


        let efectivo = 0;
        let tarjeta = 0;
        let transferencia = 0;


        for (const pago of pagos) {

            const monto = Number(pago.monto);

            if (pago.metodo === 'EFECTIVO') {
                efectivo += monto;
            }

            if (pago.metodo === 'TARJETA') {
                tarjeta += monto;
            }

            if (pago.metodo === 'TRANSFERENCIA') {
                transferencia += monto;
            }

        }


        // ==============================
        // PRODUCTOS MÁS VENDIDOS
        // ==============================

        const productosMasVendidos =
            await DetalleVenta.findAll({

                attributes: [

                    'producto_id',

                    [
                        sequelize.fn(
                            'SUM',
                            sequelize.col(
                                'DetalleVenta.cantidad'
                            )
                        ),
                        'cantidad_vendida'
                    ],

                    [
                        sequelize.fn(
                            'SUM',
                            sequelize.col(
                                'DetalleVenta.subtotal'
                            )
                        ),
                        'total_generado'
                    ]

                ],

                include: [

                    {

                        model: Producto,
                        as: 'producto',

                        attributes: [
                            'id',
                            'codigo',
                            'nombre'
                        ]

                    },

                    {

                        model: Venta,
                        as: 'venta',

                        attributes: [],

                        required: true,

                        where: {

                            estado: 'COMPLETADA',

                            created_at: {
                                [Op.between]: [
                                    inicio,
                                    fin
                                ]
                            }

                        }

                    }

                ],

                group: [
                    'DetalleVenta.producto_id',
                    'producto.id',
                    'producto.codigo',
                    'producto.nombre'
                ],

                order: [

                    [
                        sequelize.literal(
                            '"cantidad_vendida"'
                        ),
                        'DESC'
                    ]

                ],

                limit: 10

            });


        // ==============================
        // RESPUESTA
        // ==============================

        return res.json({

            periodo: {
                fecha_inicio,
                fecha_fin
            },

            resumen: {

                cantidad_ventas:
                    ventasCompletadas.length,

                total_ventas:
                    totalVentas,

                ventas_anuladas:
                    ventasAnuladas.length,

                total_descuentos:
                    totalDescuentos

            },

            pagos: {

                efectivo,

                tarjeta,

                transferencia

            },

            productos_mas_vendidos:
                productosMasVendidos,

            ventas

        });


    } catch (error) {

        console.error(
            'Error al obtener reporte de ventas:',
            error
        );

        return res.status(500).json({
            message: 'Error interno del servidor'
        });

    }

};


// ==============================
// REPORTE DE CAJAS
// ==============================

const obtenerReporteCajas = async (req, res) => {

    try {

        const { fecha_inicio, fecha_fin } = req.query;


        // ==============================
        // VALIDAR FECHAS
        // ==============================

        if (!fecha_inicio || !fecha_fin) {

            return res.status(400).json({
                message: 'Debe proporcionar fecha_inicio y fecha_fin'
            });

        }


        const inicio = new Date(
            `${fecha_inicio}T00:00:00.000`
        );

        const fin = new Date(
            `${fecha_fin}T23:59:59.999`
        );


        if (
            isNaN(inicio.getTime()) ||
            isNaN(fin.getTime())
        ) {

            return res.status(400).json({
                message: 'Las fechas proporcionadas no son válidas'
            });

        }


        if (inicio > fin) {

            return res.status(400).json({
                message:
                    'La fecha_inicio no puede ser mayor que fecha_fin'
            });

        }


        // ==============================
        // BUSCAR CAJAS
        // ==============================

        const cajas = await Caja.findAll({

            where: {

                fecha_apertura: {
                    [Op.between]: [inicio, fin]
                }

            },

            include: [

                {

                    association: 'usuario',

                    attributes: [
                        'id',
                        'nombre',
                        'email'
                    ]

                },

                {

                    association: 'movimientos',

                    attributes: [
                        'id',
                        'tipo',
                        'monto',
                        'motivo',
                        'created_at'
                    ]

                }

            ],

            order: [
                ['fecha_apertura', 'DESC']
            ]

        });


        // ==============================
        // CALCULAR RESUMEN
        // ==============================

        const resultado = [];


        for (const caja of cajas) {

            let ingresos = 0;
            let egresos = 0;


            for (const movimiento of caja.movimientos) {

                const monto =
                    Number(movimiento.monto);


                if (movimiento.tipo === 'INGRESO') {

                    ingresos += monto;

                }


                if (movimiento.tipo === 'EGRESO') {

                    egresos += monto;

                }

            }


            const montoInicial =
                Number(caja.monto_inicial);


            const montoEsperado =
                montoInicial
                + ingresos
                - egresos;


            resultado.push({

                id: caja.id,

                usuario: caja.usuario
                    ? {
                        id: caja.usuario.id,
                        nombre: caja.usuario.nombre,
                        email: caja.usuario.email
                    }
                    : null,

                fecha_apertura:
                    caja.fecha_apertura,

                fecha_cierre:
                    caja.fecha_cierre,

                monto_inicial:
                    montoInicial,

                ingresos,

                egresos,

                monto_esperado:
                    montoEsperado,

                monto_final:
                    caja.monto_final !== null
                        ? Number(caja.monto_final)
                        : null,

                diferencia:
                    caja.diferencia !== null
                        ? Number(caja.diferencia)
                        : null,

                estado:
                    caja.estado,

                observaciones:
                    caja.observaciones

            });

        }


        // ==============================
        // RESPUESTA
        // ==============================

        return res.json({

            periodo: {

                fecha_inicio,
                fecha_fin

            },

            total_cajas:
                resultado.length,

            cajas:
                resultado

        });


    } catch (error) {

        console.error(
            'Error al obtener reporte de cajas:',
            error
        );

        return res.status(500).json({

            message:
                'Error interno del servidor'

        });

    }

};


// ==============================
// EXPORTAR
// ==============================

module.exports = {

    obtenerReporteVentas,
    obtenerReporteCajas

};