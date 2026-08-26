const {
    Caja,
    MovimientoCaja,
    sequelize
} = require('../models');

const construirRespuestaCaja = (caja) => {
    const cajaJson = caja.toJSON();
    const movimientos = cajaJson.movimientos || [];

    let ingresos = 0;
    let egresos = 0;

    for (const movimiento of movimientos) {
        if (movimiento.tipo === 'INGRESO') {
            ingresos += Number(movimiento.monto);
        }

        if (movimiento.tipo === 'EGRESO') {
            egresos += Number(movimiento.monto);
        }
    }

    const montoInicial = Number(cajaJson.monto_inicial);
    const montoEsperado =
        cajaJson.estado === 'ABIERTA'
            ? montoInicial + ingresos - egresos
            : Number(cajaJson.monto_esperado);

    return {
        ...cajaJson,
        monto_inicial: montoInicial,
        ingresos,
        egresos,
        monto_esperado: montoEsperado
    };
};


// ==============================
// ABRIR CAJA
// ==============================

const abrirCaja = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {

        const { monto_inicial = 0 } = req.body;

        const monto = Number(monto_inicial);

        if (isNaN(monto) || monto < 0) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'El monto inicial debe ser un número válido mayor o igual a 0'
            });
        }

        // ==============================
        // VERIFICAR CAJA ABIERTA
        // ==============================

        const cajaAbierta = await Caja.findOne({
            where: {
                usuario_id: req.user.id,
                estado: 'ABIERTA'
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (cajaAbierta) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Ya tienes una caja abierta',
                caja_id: cajaAbierta.id
            });
        }

        // ==============================
        // CREAR CAJA
        // ==============================

        const caja = await Caja.create(
            {
                usuario_id: req.user.id,
                monto_inicial: monto,
                monto_esperado: monto,
                estado: 'ABIERTA'
            },
            {
                transaction
            }
        );

        await transaction.commit();

        return res.status(201).json({
            message: 'Caja abierta correctamente',
            caja
        });

    } catch (error) {

        await transaction.rollback();

        console.error('Error al abrir caja:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// OBTENER CAJA ACTUAL
// ==============================

const obtenerCajaActual = async (req, res) => {

    try {

        const caja = await Caja.findOne({
            where: {
                usuario_id: req.user.id,
                estado: 'ABIERTA'
            },
            include: [
                {
                    association: 'movimientos'
                }
            ]
        });

        if (!caja) {
            return res.status(404).json({
                message: 'No tienes una caja abierta'
            });
        }

        return res.json(construirRespuestaCaja(caja));

    } catch (error) {

        console.error('Error al obtener caja:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// HISTORIAL DE CAJAS
// ==============================
const historialCajas = async (req, res) => {
    try {
        const cajas = await Caja.findAll({
            where: {
                usuario_id: req.user.id
            },
            order: [['fecha_apertura', 'DESC']]
        });

        return res.json({
            total: cajas.length,
            cajas
        });

    } catch (error) {

        console.error('Error al obtener historial de cajas:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// OBTENER CAJA POR ID
// ==============================

const obtenerCajaPorId = async (req, res) => {

    try {

        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: 'El id de la caja debe ser un número válido'
            });
        }

        const caja = await Caja.findOne({
            where: {
                id,
                usuario_id: req.user.id
            },
            include: [
                {
                    association: 'movimientos'
                }
            ],
            order: [
                [
                    { model: MovimientoCaja, as: 'movimientos' },
                    'created_at',
                    'ASC'
                ]
            ]
        });

        if (!caja) {
            return res.status(404).json({
                message: 'Caja no encontrada'
            });
        }

        return res.json(construirRespuestaCaja(caja));

    } catch (error) {

        console.error('Error al obtener caja por id:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};




// ==============================
// REGISTRAR MOVIMIENTO DE CAJA
// ==============================

const registrarMovimiento = async (req, res) => {

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

        if (!tipo || !['INGRESO', 'EGRESO'].includes(tipo)) {

            await transaction.rollback();

            return res.status(400).json({
                message: 'El tipo debe ser INGRESO o EGRESO'
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
        // OBTENER MOVIMIENTOS
        // ==============================

        const movimientos = await MovimientoCaja.findAll({
            where: {
                caja_id: caja.id
            },
            transaction
        });

        // ==============================
        // CALCULAR EFECTIVO ACTUAL
        // ==============================

        let efectivoActual = Number(caja.monto_inicial);

        for (const movimiento of movimientos) {

            if (movimiento.tipo === 'INGRESO') {

                efectivoActual += Number(movimiento.monto);

            } else if (movimiento.tipo === 'EGRESO') {

                efectivoActual -= Number(movimiento.monto);
            }
        }

        // ==============================
        // VALIDAR EGRESO
        // ==============================

        if (tipo === 'EGRESO' && cantidad > efectivoActual) {

            await transaction.rollback();

            return res.status(400).json({
                message: 'El monto de salida supera el efectivo disponible en caja',
                efectivo_disponible: efectivoActual,
                monto_solicitado: cantidad
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

        // ==============================
        // CALCULAR NUEVO EFECTIVO
        // ==============================

        const nuevoEfectivo =
            tipo === 'INGRESO'
                ? efectivoActual + cantidad
                : efectivoActual - cantidad;

        await transaction.commit();

        return res.status(201).json({
            message: 'Movimiento registrado correctamente',
            movimiento,
            efectivo_actual: nuevoEfectivo
        });

    } catch (error) {

        await transaction.rollback();

        console.error('Error al registrar movimiento de caja:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// CERRAR CAJA
// ==============================

const cerrarCaja = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {

        const {
            monto_final,
            observaciones
        } = req.body;

        // ==============================
        // VALIDAR MONTO FINAL
        // ==============================

        if (monto_final === undefined) {

            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe proporcionar el monto final'
            });
        }

        const montoFinal = Number(monto_final);

        if (isNaN(montoFinal) || montoFinal < 0) {

            await transaction.rollback();

            return res.status(400).json({
                message: 'El monto final debe ser un número válido mayor o igual a 0'
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

            return res.status(404).json({
                message: 'No tienes una caja abierta'
            });
        }

        // ==============================
        // OBTENER MOVIMIENTOS
        // ==============================

        const movimientos = await MovimientoCaja.findAll({
            where: {
                caja_id: caja.id
            },
            transaction
        });

        // ==============================
        // CALCULAR INGRESOS
        // ==============================

        let ingresos = 0;
        let egresos = 0;

        for (const movimiento of movimientos) {

            if (movimiento.tipo === 'INGRESO') {
                ingresos += Number(movimiento.monto);
            }

            if (movimiento.tipo === 'EGRESO') {
                egresos += Number(movimiento.monto);
            }
        }

        // ==============================
        // CALCULAR MONTO ESPERADO
        // ==============================

        const montoInicial = Number(caja.monto_inicial);

        const montoEsperado =
            montoInicial +
            ingresos -
            egresos;

        // ==============================
        // CALCULAR DIFERENCIA
        // ==============================

        const diferencia =
            montoFinal -
            montoEsperado;

        // ==============================
        // ACTUALIZAR CAJA
        // ==============================

        caja.fecha_cierre = new Date();

        caja.monto_esperado = montoEsperado;

        caja.monto_final = montoFinal;

        caja.diferencia = diferencia;

        caja.estado = 'CERRADA';

        caja.observaciones =
            observaciones
                ? observaciones.trim()
                : null;

        await caja.save({
            transaction
        });

        await transaction.commit();

        // ==============================
        // RESPUESTA
        // ==============================

        return res.json({

            message: 'Caja cerrada correctamente',

            caja: {

                id: caja.id,

                fecha_apertura: caja.fecha_apertura,

                fecha_cierre: caja.fecha_cierre,

                monto_inicial: montoInicial,

                ingresos,

                egresos,

                monto_esperado: montoEsperado,

                monto_final: montoFinal,

                diferencia,

                estado: caja.estado,

                observaciones: caja.observaciones
            }
        });

    } catch (error) {

        await transaction.rollback();

        console.error('Error al cerrar caja:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// LISTAR CAJAS
// ==============================

const listarCajas = async (req, res) => {

    try {

        const cajas = await Caja.findAll({
            where: {
                usuario_id: req.user.id
            },
            order: [
                ['fecha_apertura', 'DESC']
            ]
        });

        return res.json({
            total: cajas.length,
            cajas
        });

    } catch (error) {

        console.error('Error al listar cajas:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


module.exports = {
    abrirCaja,
    obtenerCajaActual,
    registrarMovimiento,
    cerrarCaja,
    listarCajas,
    historialCajas,
    obtenerCajaPorId
};
