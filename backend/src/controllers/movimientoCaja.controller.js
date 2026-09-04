const {
    Caja,
    MovimientoCaja,
    sequelize
} = require('../models');


// ==============================
// CREAR MOVIMIENTO DE CAJA
// ==============================

const crearMovimiento = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {

        const {
            tipo,
            monto,
            motivo
        } = req.body;

        // ==============================
        // VALIDAR TIPO
        // ==============================

        const tiposPermitidos = [
            'INGRESO',
            'EGRESO'
        ];

        if (!tiposPermitidos.includes(tipo)) {

            await transaction.rollback();

            return res.status(400).json({
                message: 'El tipo de movimiento debe ser INGRESO o EGRESO'
            });
        }

        // ==============================
        // VALIDAR MONTO
        // ==============================

        const cantidad = Number(monto);

        if (isNaN(cantidad) || cantidad <= 0) {

            await transaction.rollback();

            return res.status(400).json({
                message: 'El monto debe ser mayor que 0'
            });
        }

        // ==============================
        // VALIDAR MOTIVO
        // ==============================

        if (!motivo || !motivo.trim()) {

            await transaction.rollback();

            return res.status(400).json({
                message: 'El motivo es obligatorio'
            });
        }

        // ==============================
        // BUSCAR CAJA ABIERTA
        // ==============================

        const caja = await Caja.findOne({
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
                message: 'No tienes una caja abierta'
            });
        }

        // ==============================
        // CREAR MOVIMIENTO
        // ==============================

        const movimiento = await MovimientoCaja.create(
            {
                caja_id: caja.id,
                usuario_id: req.user.id,
                tipo,
                monto: cantidad,
                motivo: motivo.trim()
            },
            {
                transaction
            }
        );

        await transaction.commit();

        return res.status(201).json({
            message: 'Movimiento de caja registrado correctamente',
            movimiento
        });

    } catch (error) {

        await transaction.rollback();

        console.error(
            'Error al crear movimiento de caja:',
            error
        );

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// LISTAR MOVIMIENTOS
// ==============================

const listarMovimientos = async (req, res) => {

    try {

        const movimientos = await MovimientoCaja.findAll({

            where: {
                usuario_id: req.user.id
            },

            include: [
                {
                    association: 'caja',
                    attributes: [
                        'id',
                        'fecha_apertura',
                        'fecha_cierre',
                        'estado'
                    ]
                },
                {
                    association: 'venta',
                    attributes: ['id', 'numero', 'subtotal', 'descuento', 'total'],
                    include: [
                        {
                            association: 'detalles',
                            attributes: ['id', 'cantidad', 'precio_unitario', 'descuento', 'subtotal'],
                            include: [
                                {
                                    association: 'producto',
                                    attributes: ['id', 'codigo', 'nombre']
                                }
                            ]
                        }
                    ]
                }
            ],

            order: [
                ['created_at', 'DESC']
            ]
        });

        return res.json(movimientos.map((movimiento) => {
            const movimientoJson = movimiento.toJSON();
            const detalles = movimientoJson.venta?.detalles || [];

            return {
                ...movimientoJson,
                descuento_productos: Number(
                    detalles.reduce(
                        (total, detalle) => total + Number(detalle.descuento || 0) * Number(detalle.cantidad || 0),
                        0
                    ).toFixed(2)
                )
            };
        }));

    } catch (error) {

        console.error(
            'Error al listar movimientos de caja:',
            error
        );

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


module.exports = {
    crearMovimiento,
    listarMovimientos
};