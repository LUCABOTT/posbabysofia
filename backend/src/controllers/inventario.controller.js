const {
    Producto,
    MovimientoInventario,
    sequelize
} = require('../models');


// ==============================
// ENTRADA DE INVENTARIO
// ==============================
const entradaInventario = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { producto_id, cantidad, motivo } = req.body;

        if (!producto_id || !cantidad || cantidad <= 0) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'producto_id y una cantidad mayor que 0 son obligatorios'
            });
        }

        const producto = await Producto.findByPk(producto_id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!producto) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Producto no encontrado'
            });
        }

        if (!producto.activo) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'El producto está inactivo'
            });
        }

        const stockAnterior = producto.stock;
        const stockNuevo = stockAnterior + Number(cantidad);

        await producto.update(
            {
                stock: stockNuevo
            },
            { transaction }
        );

        const movimiento = await MovimientoInventario.create(
            {
                producto_id: producto.id,
                usuario_id: req.user.id,
                tipo: 'ENTRADA',
                cantidad: Number(cantidad),
                stock_anterior: stockAnterior,
                stock_nuevo: stockNuevo,
                motivo: motivo || null
            },
            { transaction }
        );

        await transaction.commit();

        res.status(201).json({
            message: 'Entrada de inventario registrada correctamente',
            movimiento,
            stock: stockNuevo
        });

    } catch (error) {
        await transaction.rollback();

        console.error('Error en entrada de inventario:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// SALIDA DE INVENTARIO
// ==============================
const salidaInventario = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { producto_id, cantidad, motivo } = req.body;

        if (!producto_id || !cantidad || cantidad <= 0) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'producto_id y una cantidad mayor que 0 son obligatorios'
            });
        }

        const producto = await Producto.findByPk(producto_id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!producto) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Producto no encontrado'
            });
        }

        if (!producto.activo) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'El producto está inactivo'
            });
        }

        const stockAnterior = producto.stock;
        const cantidadSalida = Number(cantidad);

        if (cantidadSalida > stockAnterior) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Stock insuficiente',
                stock_actual: stockAnterior,
                cantidad_solicitada: cantidadSalida
            });
        }

        const stockNuevo = stockAnterior - cantidadSalida;

        await producto.update(
            {
                stock: stockNuevo
            },
            { transaction }
        );

        const movimiento = await MovimientoInventario.create(
            {
                producto_id: producto.id,
                usuario_id: req.user.id,
                tipo: 'SALIDA',
                cantidad: cantidadSalida,
                stock_anterior: stockAnterior,
                stock_nuevo: stockNuevo,
                motivo: motivo || null
            },
            { transaction }
        );

        await transaction.commit();

        res.status(201).json({
            message: 'Salida de inventario registrada correctamente',
            movimiento,
            stock: stockNuevo
        });

    } catch (error) {
        await transaction.rollback();

        console.error('Error en salida de inventario:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// AJUSTE DE INVENTARIO
// ==============================
const ajustarInventario = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { producto_id, stock_nuevo, motivo } = req.body;

        if (
            !producto_id ||
            stock_nuevo === undefined ||
            stock_nuevo < 0
        ) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'producto_id y stock_nuevo válido son obligatorios'
            });
        }

        if (!motivo) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'El motivo del ajuste es obligatorio'
            });
        }

        const producto = await Producto.findByPk(producto_id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!producto) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Producto no encontrado'
            });
        }

        if (!producto.activo) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'El producto está inactivo'
            });
        }

        const stockAnterior = producto.stock;
        const stockNuevo = Number(stock_nuevo);

        await producto.update(
            {
                stock: stockNuevo
            },
            { transaction }
        );

        const movimiento = await MovimientoInventario.create(
            {
                producto_id: producto.id,
                usuario_id: req.user.id,
                tipo: 'AJUSTE',
                cantidad: Math.abs(stockNuevo - stockAnterior),
                stock_anterior: stockAnterior,
                stock_nuevo: stockNuevo,
                motivo
            },
            { transaction }
        );

        await transaction.commit();

        res.status(201).json({
            message: 'Ajuste de inventario realizado correctamente',
            movimiento,
            stock: stockNuevo
        });

    } catch (error) {
        await transaction.rollback();

        console.error('Error en ajuste de inventario:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// LISTAR MOVIMIENTOS
// ==============================
const listarMovimientos = async (req, res) => {
    try {
        const movimientos = await MovimientoInventario.findAll({
            include: [
                {
                    model: Producto,
                    as: 'producto',
                    attributes: [
                        'id',
                        'codigo',
                        'nombre'
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(movimientos);

    } catch (error) {
        console.error('Error al listar movimientos:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// MOVIMIENTOS DE UN PRODUCTO
// ==============================
const movimientosProducto = async (req, res) => {
    try {
        const movimientos = await MovimientoInventario.findAll({
            where: {
                producto_id: req.params.id
            },
            include: [
                {
                    model: Producto,
                    as: 'producto',
                    attributes: [
                        'id',
                        'codigo',
                        'nombre'
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(movimientos);

    } catch (error) {
        console.error('Error al consultar movimientos:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


module.exports = {
    entradaInventario,
    salidaInventario,
    ajustarInventario,
    listarMovimientos,
    movimientosProducto
};