const {
    sequelize,
    Venta,
    Pago,
    DetalleVenta,
    Producto,
    Caja,
    MovimientoCaja
} = require('../models');

const { Op } = require('sequelize');


// ==============================
// DASHBOARD GENERAL
// ==============================
const obtenerDashboard = async (req, res) => {
    try {

        // ==============================
        // FECHAS
        // ==============================

        const ahora = new Date();

        const inicioDia = new Date(ahora);
        inicioDia.setHours(0, 0, 0, 0);

        const finDia = new Date(ahora);
        finDia.setHours(23, 59, 59, 999);

        // ==============================
        // VENTAS DEL DÍA
        // ==============================

        const ventasDia = await Venta.findAll({
            where: {
                created_at: {
                    [Op.between]: [inicioDia, finDia]
                }
            }
        });

        const ventasCompletadas = ventasDia.filter(
            venta => venta.estado === 'COMPLETADA'
        );

        const ventasAnuladas = ventasDia.filter(
            venta => venta.estado === 'ANULADA'
        );

        const totalVentas = ventasCompletadas.reduce(
            (total, venta) => total + Number(venta.total),
            0
        );

        // ==============================
        // PAGOS DEL DÍA
        // ==============================

        const pagos = await Pago.findAll({
            include: [
                {
                    model: Venta,
                    as: 'venta',
                    required: true,
                    where: {
                        estado: 'COMPLETADA',
                        created_at: {
                            [Op.between]: [inicioDia, finDia]
                        }
                    }
                }
            ]
        });

        const ventasEfectivo = pagos
            .filter(pago => pago.metodo === 'EFECTIVO')
            .reduce(
                (total, pago) => total + Number(pago.monto),
                0
            );

        const ventasTarjeta = pagos
            .filter(pago => pago.metodo === 'TARJETA')
            .reduce(
                (total, pago) => total + Number(pago.monto),
                0
            );

        const ventasTransferencia = pagos
            .filter(pago => pago.metodo === 'TRANSFERENCIA')
            .reduce(
                (total, pago) => total + Number(pago.monto),
                0
            );

        // ==============================
        // PRODUCTOS MÁS VENDIDOS
        // ==============================

        const productosMasVendidos = await DetalleVenta.findAll({
            attributes: [
                'producto_id',
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.col('DetalleVenta.cantidad')
                    ),
                    'cantidad_vendida'
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.col('DetalleVenta.subtotal')
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
                    where: {
                        estado: 'COMPLETADA',
                        created_at: {
                            [Op.between]: [inicioDia, finDia]
                        }
                    }
                }
            ],
            group: [
                'DetalleVenta.producto_id',
                'producto.id'
            ],
            order: [
                [
                    sequelize.literal('cantidad_vendida'),
                    'DESC'
                ]
            ],
            limit: 5
        });

        // ==============================
        // PRODUCTOS CON STOCK BAJO
        // ==============================

        const productosStockBajo = await Producto.findAll({
            where: {
                activo: true,
                stock: {
                    [Op.lte]: sequelize.col('stock_minimo')
                }
            },
            attributes: [
                'id',
                'codigo',
                'nombre',
                'stock',
                'stock_minimo'
            ],
            order: [['stock', 'ASC']]
        });

        // ==============================
        // CAJA ACTUAL
        // ==============================

        const cajaActual = await Caja.findOne({
            where: {
                usuario_id: req.user.id,
                estado: 'ABIERTA'
            }
        });

        let resumenCaja = null;

        if (cajaActual) {

            const movimientosCaja = await MovimientoCaja.findAll({
                where: {
                    caja_id: cajaActual.id
                }
            });

            let ingresos = 0;
            let egresos = 0;

            for (const movimiento of movimientosCaja) {

                if (movimiento.tipo === 'INGRESO') {
                    ingresos += Number(movimiento.monto);
                }

                if (movimiento.tipo === 'EGRESO') {
                    egresos += Number(movimiento.monto);
                }
            }

            const montoEsperado =
                Number(cajaActual.monto_inicial)
                + ingresos
                - egresos;

            resumenCaja = {
                id: cajaActual.id,
                monto_inicial: Number(cajaActual.monto_inicial),
                ingresos,
                egresos,
                monto_esperado: montoEsperado,
                estado: cajaActual.estado
            };
        }

        // ==============================
        // RESPUESTA
        // ==============================

        return res.json({
            fecha: inicioDia.toISOString().split('T')[0],

            ventas: {
                cantidad: ventasCompletadas.length,
                total: totalVentas,
                anuladas: ventasAnuladas.length
            },

            pagos: {
                efectivo: ventasEfectivo,
                tarjeta: ventasTarjeta,
                transferencia: ventasTransferencia
            },

            productos_mas_vendidos: productosMasVendidos,

            productos_stock_bajo: productosStockBajo,

            caja: resumenCaja
        });

    } catch (error) {

        console.error(
            'Error al obtener dashboard:',
            error
        );

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


module.exports = {
    obtenerDashboard
};
