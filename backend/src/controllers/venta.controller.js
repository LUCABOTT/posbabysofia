
const {
    sequelize,
    Venta,
    DetalleVenta,
    Producto,
    Cliente,
    Pago,
    MovimientoInventario,
    Caja,
    MovimientoCaja,
    Factura,
    ConfiguracionFiscal
} = require('../models');

const { Op } = require('sequelize');


// =========================
// CREAR VENTA
// =========================

const crearVenta = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {

        const {
            cliente_id,
            productos,
            descuento = 0,
            pago
        } = req.body;


        // =========================
        // 1. VALIDACIONES BÁSICAS
        // =========================

        if (
            !productos ||
            !Array.isArray(productos) ||
            productos.length === 0
        ) {

            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe proporcionar al menos un producto'
            });
        }


        if (Number(descuento) < 0) {

            await transaction.rollback();

            return res.status(400).json({
                message: 'El descuento no puede ser negativo'
            });
        }


        // =========================
        // 2. CLIENTE
        // =========================

        let cliente = null;

        if (cliente_id) {

            cliente = await Cliente.findByPk(
                cliente_id,
                {
                    transaction
                }
            );

            if (!cliente) {

                await transaction.rollback();

                return res.status(404).json({
                    message:
                        `Cliente con ID ${cliente_id} no encontrado`
                });
            }


            if (!cliente.activo) {

                await transaction.rollback();

                return res.status(400).json({
                    message:
                        `El cliente "${cliente.nombre}" está inactivo`
                });
            }
        }


        // =========================
        // 3. BUSCAR PRODUCTOS
        // =========================

        const detalles = [];

        for (const item of productos) {

            const {
                producto_id,
                cantidad
            } = item;


            if (
                !producto_id ||
                !cantidad ||
                cantidad <= 0
            ) {

                await transaction.rollback();

                return res.status(400).json({
                    message:
                        'Producto o cantidad inválida'
                });
            }


            const producto =
                await Producto.findByPk(
                    producto_id,
                    {
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    }
                );


            if (!producto) {

                await transaction.rollback();

                return res.status(404).json({
                    message:
                        `Producto con ID ${producto_id} no encontrado`
                });
            }


            // =========================
            // PRODUCTO ACTIVO
            // =========================

            if (!producto.activo) {

                await transaction.rollback();

                return res.status(400).json({
                    message:
                        `El producto "${producto.nombre}" está inactivo`
                });
            }


            // =========================
            // STOCK
            // =========================

            if (producto.stock < cantidad) {

                await transaction.rollback();

                return res.status(400).json({
                    message: 'Stock insuficiente',
                    producto: producto.nombre,
                    stock_disponible: producto.stock,
                    cantidad_solicitada: cantidad
                });
            }


            // =========================
            // SUBTOTAL
            // =========================

            const precioOriginal = Number(producto.precio_venta);
            const precio = producto.calcularPrecioFinal();
            const descuentoProducto = Number(
                (precioOriginal - precio).toFixed(2)
            );

            const subtotalProducto =
                precio * cantidad;


            detalles.push({
                producto,
                cantidad,
                precio_unitario: precio,
                descuento: descuentoProducto,
                subtotal: subtotalProducto
            });
        }


        // =========================
        // 4. CALCULAR TOTALES
        // =========================

        const subtotal = detalles.reduce(
            (total, detalle) =>
                total + detalle.subtotal,
            0
        );


        if (Number(descuento) > subtotal) {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'El descuento no puede ser mayor que el subtotal'
            });
        }


        const totalConDescuento =
            subtotal - Number(descuento);

        const impuesto = Number(
            (totalConDescuento * 0.15).toFixed(2)
        );

        const baseImponible = Number(
            (totalConDescuento - impuesto).toFixed(2)
        );

        const total =
            baseImponible + impuesto;


        // =========================
        // 5. VALIDAR PAGO
        // =========================

        if (
            !pago ||
            !pago.metodo ||
            pago.recibido === undefined
        ) {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'Debe proporcionar los datos del pago'
            });
        }


        const metodosPermitidos = [
            'EFECTIVO',
            'TARJETA',
            'TRANSFERENCIA'
        ];


        if (!metodosPermitidos.includes(pago.metodo)) {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'Método de pago inválido'
            });
        }


        const recibido =
            Number(pago.recibido);


        if (
            isNaN(recibido) ||
            recibido <= 0
        ) {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'El monto recibido debe ser válido'
            });
        }


        if (
            pago.metodo === 'EFECTIVO' &&
            recibido < total
        ) {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'El efectivo recibido es insuficiente',
                total,
                recibido
            });
        }


        if (
            pago.metodo !== 'EFECTIVO' &&
            recibido !== total
        ) {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'Para este método de pago, el monto debe ser igual al total'
            });
        }


        // =========================
        // 6. VALIDAR CAJA
        // =========================

        let caja = null;


        if (pago.metodo === 'EFECTIVO') {

            caja = await Caja.findOne({

                where: {
                    usuario_id: req.user.id,
                    estado: 'ABIERTA'
                },

                transaction,

                lock: transaction.LOCK.UPDATE

            });


            if (!caja) {

                await transaction.rollback();

                return res.status(400).json({
                    message:
                        'No tiene una caja abierta. Debe abrir una caja antes de realizar ventas en efectivo.'
                });
            }
        }


        // =========================
        // 7. CONFIGURACIÓN FISCAL
        // =========================

        const configuracionFiscal =
            await ConfiguracionFiscal.findOne({

                where: {
                    activo: true
                },

                order: [
                    ['id', 'DESC']
                ],

                transaction,

                lock: transaction.LOCK.UPDATE

            });


        if (!configuracionFiscal) {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'No existe una configuración fiscal activa'
            });
        }


        // =========================
        // 8. VALIDAR FECHA FISCAL
        // =========================

        const hoy =
            new Date()
                .toISOString()
                .split('T')[0];


        if (
            hoy >
            configuracionFiscal.fecha_limite_emision
        ) {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'La fecha límite de emisión de la configuración fiscal ha vencido',
                fecha_limite_emision:
                    configuracionFiscal.fecha_limite_emision
            });
        }


        // =========================
        // 9. VALIDAR CORRELATIVO
        // =========================

        const siguienteNumero =
            Number(
                configuracionFiscal.siguiente_numero
            );


        const rangoInicial =
            Number(
                configuracionFiscal.rango_inicial
            );


        const rangoFinal =
            Number(
                configuracionFiscal.rango_final
            );


        if (
            siguienteNumero < rangoInicial ||
            siguienteNumero > rangoFinal
        ) {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'Se ha agotado el rango autorizado de facturación',
                rango_inicial: rangoInicial,
                rango_final: rangoFinal,
                siguiente_numero: siguienteNumero
            });
        }


        // =========================
        // 10. GENERAR NÚMERO DE VENTA
        // =========================

        const numero =
            `V-${Date.now()}`;


        // =========================
        // 11. CREAR VENTA
        // =========================

        const venta =
            await Venta.create({

                cliente_id:
                    cliente_id || null,

                usuario_id:
                    req.user.id,

                numero,

                subtotal,

                descuento:
                    Number(descuento),

                impuesto,

                total,

                estado:
                    'COMPLETADA'

            }, {
                transaction
            });


        // =========================
        // 12. CREAR DETALLES
        // =========================

        for (const detalle of detalles) {

            await DetalleVenta.create({

                venta_id:
                    venta.id,

                producto_id:
                    detalle.producto.id,

                cantidad:
                    detalle.cantidad,

                precio_unitario:
                    detalle.precio_unitario,

                descuento:
                    detalle.descuento,

                subtotal:
                    detalle.subtotal

            }, {
                transaction
            });


            // =========================
            // DESCONTAR STOCK
            // =========================

            const stockAnterior =
                detalle.producto.stock;


            const stockNuevo =
                stockAnterior -
                detalle.cantidad;


            detalle.producto.stock =
                stockNuevo;


            await detalle.producto.save({
                transaction
            });


            // =========================
            // MOVIMIENTO INVENTARIO
            // =========================

            await MovimientoInventario.create({

                producto_id:
                    detalle.producto.id,

                usuario_id:
                    req.user.id,

                tipo:
                    'SALIDA',

                cantidad:
                    detalle.cantidad,

                stock_anterior:
                    stockAnterior,

                stock_nuevo:
                    stockNuevo,

                motivo:
                    `Salida por venta ${venta.numero}`

            }, {
                transaction
            });
        }


        // =========================
        // 13. CREAR PAGO
        // =========================

        const cambio =
            recibido - total;


        await Pago.create({

            venta_id:
                venta.id,

            metodo:
                pago.metodo,

            monto:
                total,

            monto_recibido:
                recibido,

            cambio:
                cambio,

            referencia:
                pago.referencia || null

        }, {
            transaction
        });


        // =========================
        // 14. MOVIMIENTO DE CAJA
        // =========================

        if (pago.metodo === 'EFECTIVO') {

            const descuentoProductos = Number(
                detalles.reduce(
                    (totalDescuento, detalle) =>
                        totalDescuento +
                        detalle.descuento * detalle.cantidad,
                    0
                ).toFixed(2)
            );

            const detalleDescuento = descuentoProductos > 0
                ? ` | Descuento productos: L ${descuentoProductos.toFixed(2)}`
                : '';

            await MovimientoCaja.create({

                caja_id:
                    caja.id,

                usuario_id:
                    req.user.id,

                venta_id: venta.id,

                tipo:
                    'INGRESO',

                monto:
                    total,

                motivo:
                    `Venta ${venta.numero}${detalleDescuento}`

            }, {
                transaction
            });
        }


        // =========================
        // 15. GENERAR NÚMERO DE FACTURA
        // =========================

        const numeroCorrelativo =
            siguienteNumero
                .toString()
                .padStart(8, '0');


        const numeroFactura =
            `${configuracionFiscal.prefijo_factura}-${numeroCorrelativo}`;


        // =========================
        // 16. CREAR FACTURA
        // =========================

        const factura =
            await Factura.create({

                venta_id:
                    venta.id,

                configuracion_fiscal_id:
                    configuracionFiscal.id,

                numero_factura:
                    numeroFactura,

                numero_correlativo:
                    siguienteNumero,

                cai:
                    configuracionFiscal.cai,

                rtn_emisor:
                    configuracionFiscal.rtn,

                fecha_emision:
                    hoy,

                estado:
                    'EMITIDA'

            }, {
                transaction
            });


        // =========================
        // 17. INCREMENTAR CORRELATIVO
        // =========================

        configuracionFiscal.siguiente_numero =
            siguienteNumero + 1;


        await configuracionFiscal.save({
            transaction
        });


        // =========================
        // 18. CONFIRMAR TRANSACCIÓN
        // =========================

        await transaction.commit();


        // =========================
        // 19. RESPUESTA
        // =========================

        return res.status(201).json({

            message:
                'Venta creada correctamente',

            venta: {

                id:
                    venta.id,

                numero:
                    venta.numero,

                subtotal:
                    venta.subtotal,

                descuento:
                    venta.descuento,

                impuesto:
                    venta.impuesto,

                base_gravada:
                    baseImponible,

                total:
                    venta.total,

                estado:
                    venta.estado
            },


            factura: {

                id:
                    factura.id,

                numero_factura:
                    factura.numero_factura,

                numero_correlativo:
                    factura.numero_correlativo,

                cai:
                    factura.cai,

                rtn_emisor:
                    factura.rtn_emisor,

                fecha_emision:
                    factura.fecha_emision,

                estado:
                    factura.estado
            },


            pago: {

                metodo:
                    pago.metodo,

                monto:
                    total,

                recibido,

                cambio
            }
        });


    } catch (error) {

        await transaction.rollback();

        console.error(
            'Error al crear venta:',
            error
        );


        return res.status(500).json({
            message:
                'Error interno del servidor'
        });
    }
};

const listarVentas = async (req, res) => {
    try {

        const ventas = await Venta.findAll({
            include: [
                {
                    association: 'usuario',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    association: 'cliente',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    association: 'detalles',
                    include: [
                        {
                            association: 'producto',
                            attributes: [
                                'id',
                                'codigo',
                                'nombre',
                                'precio_venta'
                            ]
                        }
                    ]
                },
                {
                    association: 'factura',
                    attributes: [
                        'id',
                        'numero_factura',
                        'numero_correlativo',
                        'cai',
                        'rtn_emisor',
                        'fecha_emision',
                        'estado'
                    ]
                },
                {
                    association: 'pagos',
                    attributes: [
                        'id',
                        'metodo',
                        'monto',
                        'monto_recibido',
                        'cambio',
                        'referencia'
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.json({
            total: ventas.length,
            ventas
        });

    } catch (error) {

        console.error('Error al listar ventas:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


const obtenerVenta = async (req, res) => {
    try {

        const { id } = req.params;

        const venta = await Venta.findByPk(id, {
            include: [
                {
                    association: 'usuario',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    association: 'cliente',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    association: 'detalles',
                    include: [
                        {
                            association: 'producto',
                            attributes: [
                                'id',
                                'codigo',
                                'nombre',
                                'precio_venta'
                            ]
                        }
                    ]
                },
                {
                    association: 'factura',
                    attributes: [
                        'id',
                        'numero_factura',
                        'numero_correlativo',
                        'cai',
                        'rtn_emisor',
                        'fecha_emision',
                        'estado'
                    ]
                },
                {
                    association: 'pagos',
                    attributes: [
                        'id',
                        'metodo',
                        'monto',
                        'monto_recibido',
                        'cambio',
                        'referencia'
                    ]
                }
            ]
        });

        if (!venta) {
            return res.status(404).json({
                message: 'Venta no encontrada'
            });
        }

        return res.json(venta);

    } catch (error) {

        console.error('Error al obtener venta:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


const anularVenta = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {

        const { id } = req.params;


        // =========================
        // 1. OBTENER VENTA
        // =========================

        const venta = await Venta.findByPk(
            id,
            {
                transaction,
                lock: transaction.LOCK.UPDATE
            }
        );


        if (!venta) {

            await transaction.rollback();

            return res.status(404).json({
                message: 'Venta no encontrada'
            });
        }


        // =========================
        // 2. VALIDAR ESTADO
        // =========================

        if (venta.estado === 'ANULADA') {

            await transaction.rollback();

            return res.status(400).json({
                message: 'La venta ya está anulada'
            });
        }


        // =========================
        // 3. OBTENER FACTURA
        // =========================

        const factura = await Factura.findOne({

            where: {
                venta_id: venta.id
            },

            transaction,

            lock: transaction.LOCK.UPDATE

        });


        // =========================
        // 4. VALIDAR FACTURA
        // =========================

        if (!factura) {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'La venta no tiene una factura asociada'
            });
        }


        if (factura.estado === 'ANULADA') {

            await transaction.rollback();

            return res.status(400).json({
                message:
                    'La factura asociada ya está anulada'
            });
        }


        // =========================
        // 5. OBTENER DETALLES
        // =========================

        const detalles = await DetalleVenta.findAll({

            where: {
                venta_id: venta.id
            },

            transaction

        });


        // =========================
        // 6. DEVOLVER STOCK
        // =========================

        for (const detalle of detalles) {

            const producto =
                await Producto.findByPk(
                    detalle.producto_id,
                    {
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    }
                );


            if (!producto) {

                await transaction.rollback();

                return res.status(404).json({
                    message:
                        `Producto ${detalle.producto_id} no encontrado`
                });
            }


            const stockAnterior =
                Number(producto.stock);


            const stockNuevo =
                stockAnterior +
                Number(detalle.cantidad);


            producto.stock =
                stockNuevo;


            await producto.save({
                transaction
            });


            // =========================
            // MOVIMIENTO INVENTARIO
            // =========================

            await MovimientoInventario.create({

                producto_id:
                    producto.id,

                usuario_id:
                    req.user.id,

                tipo:
                    'ENTRADA',

                cantidad:
                    detalle.cantidad,

                stock_anterior:
                    stockAnterior,

                stock_nuevo:
                    stockNuevo,

                motivo:
                    `Devolución por anulación de venta ${venta.numero}`

            }, {
                transaction
            });

        }


        // =========================
        // 7. OBTENER PAGO
        // =========================

        const pago = await Pago.findOne({

            where: {
                venta_id: venta.id
            },

            transaction,

            lock: transaction.LOCK.UPDATE

        });


        // =========================
        // 8. REVERTIR EFECTIVO
        // =========================

        if (
            pago &&
            pago.metodo === 'EFECTIVO'
        ) {

            const movimientoVenta =
                await MovimientoCaja.findOne({

                    where: {
                        venta_id: venta.id,
                        tipo: 'INGRESO'
                    },

                    transaction,

                    lock: transaction.LOCK.UPDATE

                });


            if (!movimientoVenta) {

                throw new Error(
                    'No se encontró el movimiento de caja asociado a la venta'
                );
            }


            await MovimientoCaja.create({

                caja_id:
                    movimientoVenta.caja_id,

                usuario_id:
                    req.user.id,

                venta_id:
                    venta.id,

                tipo:
                    'EGRESO',

                monto:
                    Number(pago.monto),

                motivo:
                    `Reversión por anulación de venta ${venta.numero}`

            }, {
                transaction
            });

        }


        // =========================
        // 9. ANULAR FACTURA
        // =========================

        factura.estado =
            'ANULADA';


        await factura.save({
            transaction
        });


        // =========================
        // 10. ANULAR VENTA
        // =========================

        venta.estado =
            'ANULADA';


        await venta.save({
            transaction
        });


        // =========================
        // 11. CONFIRMAR
        // =========================

        await transaction.commit();


        // =========================
        // 12. RESPUESTA
        // =========================

        return res.json({

            message:
                'Venta y factura anuladas correctamente',

            venta: {

                id:
                    venta.id,

                numero:
                    venta.numero,

                estado:
                    venta.estado

            },

            factura: {

                id:
                    factura.id,

                numero_factura:
                    factura.numero_factura,

                estado:
                    factura.estado

            },

            inventario:
                'Stock devuelto correctamente',

            caja:
                pago &&
                pago.metodo === 'EFECTIVO'
                    ? 'Efectivo revertido correctamente'
                    : 'No aplica reversión de efectivo'

        });


    } catch (error) {

        await transaction.rollback();

        console.error(
            'Error al anular venta:',
            error
        );


        return res.status(500).json({

            message:
                'Error interno del servidor'

        });

    }

};


module.exports = {
    crearVenta,
    listarVentas,
    obtenerVenta,
    anularVenta
};
