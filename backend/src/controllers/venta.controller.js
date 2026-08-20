const {
    sequelize,
    Venta,
    DetalleVenta,
    Producto,
    Cliente,
    Pago
} = require('../models');
const crearVenta = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { cliente_id, productos, descuento = 0, pago } = req.body;

        // =========================
        // 1. VALIDACIONES BÁSICAS
        // =========================

        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe proporcionar al menos un producto'
            });
        }

        if (descuento < 0) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'El descuento no puede ser negativo'
            });
        }

        //////////////

        let cliente = null;

if (cliente_id) {
    cliente = await Cliente.findByPk(cliente_id, {
        transaction
    });

    if (!cliente) {
        await transaction.rollback();

        return res.status(404).json({
            message: `Cliente con ID ${cliente_id} no encontrado`
        });
    }

    if (!cliente.activo) {
        await transaction.rollback();

        return res.status(400).json({
            message: `El cliente "${cliente.nombre}" está inactivo`
        });
    }
}


        // =========================
        // 2. BUSCAR PRODUCTOS
        // =========================

        const detalles = [];

        for (const item of productos) {

            const { producto_id, cantidad } = item;

            if (!producto_id || !cantidad || cantidad <= 0) {
                await transaction.rollback();

                return res.status(400).json({
                    message: 'Producto o cantidad inválida'
                });
            }

            const producto = await Producto.findByPk(producto_id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!producto) {
                await transaction.rollback();

                return res.status(404).json({
                    message: `Producto con ID ${producto_id} no encontrado`
                });
            }

            // =========================
            // 3. VALIDAR PRODUCTO ACTIVO
            // =========================

            if (!producto.activo) {
                await transaction.rollback();

                return res.status(400).json({
                    message: `El producto "${producto.nombre}" está inactivo`
                });
            }

            // =========================
            // 4. VALIDAR STOCK
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
            // 5. CALCULAR SUBTOTAL
            // =========================

            const precio = Number(producto.precio_venta);

            const subtotal = precio * cantidad;

            detalles.push({
                producto,
                cantidad,
                precio_unitario: precio,
                descuento: 0,
                subtotal
            });
        }

        // =========================
        // 6. CALCULAR TOTALES
        // =========================

        const subtotal = detalles.reduce(
            (total, detalle) => total + detalle.subtotal,
            0
        );

        if (descuento > subtotal) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'El descuento no puede ser mayor que el subtotal'
            });
        }

        const baseImponible = subtotal - Number(descuento);

        // Por ahora dejamos impuesto en 0.
        // Después lo configuraremos para el sistema fiscal.
        const impuesto = 0;

        const total = baseImponible + impuesto;

        // =========================
// VALIDAR PAGO
// =========================

if (!pago || !pago.metodo || pago.recibido === undefined) {
    await transaction.rollback();

    return res.status(400).json({
        message: 'Debe proporcionar los datos del pago'
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
        message: 'Método de pago inválido'
    });
}

const recibido = Number(pago.recibido);

if (isNaN(recibido) || recibido <= 0) {
    await transaction.rollback();

    return res.status(400).json({
        message: 'El monto recibido debe ser válido'
    });
}

if (pago.metodo === 'EFECTIVO' && recibido < total) {
    await transaction.rollback();

    return res.status(400).json({
        message: 'El efectivo recibido es insuficiente',
        total,
        recibido
    });
}

if (pago.metodo !== 'EFECTIVO' && recibido !== total) {
    await transaction.rollback();

    return res.status(400).json({
        message: 'Para este método de pago, el monto debe ser igual al total'
    });
}


        // =========================
        // 7. GENERAR NÚMERO DE VENTA
        // =========================

        const numero = `V-${Date.now()}`;

        // =========================
        // 8. CREAR VENTA
        // =========================

        const venta = await Venta.create(
            {
                cliente_id: cliente_id || null,
                usuario_id: req.user.id,
                numero,
                subtotal,
                descuento: Number(descuento),
                impuesto,
                total,
                estado: 'COMPLETADA'
            },
            { transaction }
        );

        // =========================
        // 9. CREAR DETALLES
        // =========================

        for (const detalle of detalles) {

            await DetalleVenta.create(
                {
                    venta_id: venta.id,
                    producto_id: detalle.producto.id,
                    cantidad: detalle.cantidad,
                    precio_unitario: detalle.precio_unitario,
                    descuento: detalle.descuento,
                    subtotal: detalle.subtotal
                },
                { transaction }
            );

            // =========================
            // 10. DESCONTAR STOCK
            // =========================

            detalle.producto.stock -= detalle.cantidad;

            await detalle.producto.save({
                transaction
            });
        }


        // =========================
// CREAR PAGO
// =========================

const cambio = recibido - total;

await Pago.create(
    {
        venta_id: venta.id,
        metodo: pago.metodo,
        monto: total,
        referencia: pago.referencia || null
    },
    {
        transaction
    }
);



        // =========================
        // 11. CONFIRMAR TRANSACCIÓN
        // =========================

        await transaction.commit();

        // =========================
        // 12. RESPUESTA
        // =========================

        return res.status(201).json({
            message: 'Venta creada correctamente',
            venta: {
                id: venta.id,
                numero: venta.numero,
                subtotal: venta.subtotal,
                descuento: venta.descuento,
                impuesto: venta.impuesto,
                total: venta.total,
                estado: venta.estado
            },
            pago: {
                metodo: pago.metodo,
                monto: total,
                recibido,
                cambio
            }
        });

    } catch (error) {

        await transaction.rollback();

        console.error('Error al crear venta:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
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


module.exports = {
    crearVenta,
    listarVentas,
    obtenerVenta
};