const { Cliente } = require('../models');


// CREAR CLIENTE
const crearCliente = async (req, res) => {
    try {
        const {
            nombre,
            email,
            telefono,
            rtn,
            fecha_nacimiento
        } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                message: 'El nombre es obligatorio'
            });
        }

        // Validar email duplicado
        if (email) {
            const existente = await Cliente.findOne({
                where: { email }
            });

            if (existente) {
                return res.status(409).json({
                    message: 'Ya existe un cliente con ese email'
                });
            }
        }

        const cliente = await Cliente.create({
            nombre: nombre.trim(),
            email: email || null,
            telefono: telefono || null,
            rtn: rtn || null,
            fecha_nacimiento: fecha_nacimiento || null
        });

        res.status(201).json({
            message: 'Cliente creado correctamente',
            cliente
        });

    } catch (error) {
        console.error('Error al crear cliente:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Ya existe un cliente con ese correo'
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: error.errors[0].message
            });
        }

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// LISTAR CLIENTES
const listarClientes = async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            order: [['nombre', 'ASC']]
        });

        res.json(clientes);

    } catch (error) {
        console.error('Error al listar clientes:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// OBTENER CLIENTE
const obtenerCliente = async (req, res) => {
    try {

        const cliente = await Cliente.findByPk(req.params.id, {
            include: [
                {
                    association: 'ventas'
                }
            ]
        });

        if (!cliente) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
            });
        }

        return res.json(cliente);

    } catch (error) {
        console.error('Error al obtener cliente:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ACTUALIZAR CLIENTE
const actualizarCliente = async (req, res) => {
    try {

        const cliente = await Cliente.findByPk(req.params.id);

        if (!cliente) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
            });
        }

        const {
            nombre,
            email,
            telefono,
            rtn,
            fecha_nacimiento,
            activo
        } = req.body;

        // Validar nombre
        if (nombre !== undefined && !nombre.trim()) {
            return res.status(400).json({
                message: 'El nombre no puede estar vacío'
            });
        }

        // Validar activo
        if (activo !== undefined && typeof activo !== 'boolean') {
            return res.status(400).json({
                message: 'El campo activo debe ser true o false'
            });
        }

        // Verificar email si cambió
        if (email && email !== cliente.email) {

            const existente = await Cliente.findOne({
                where: { email }
            });

            if (existente) {
                return res.status(409).json({
                    message: 'Ya existe un cliente con ese email'
                });
            }
        }

        await cliente.update({

            nombre: nombre !== undefined
                ? nombre.trim()
                : cliente.nombre,

            email: email !== undefined
                ? email
                : cliente.email,

            telefono: telefono !== undefined
                ? telefono
                : cliente.telefono,

            rtn: rtn !== undefined
                ? rtn
                : cliente.rtn,

            fecha_nacimiento: fecha_nacimiento !== undefined
                ? fecha_nacimiento
                : cliente.fecha_nacimiento,

            activo: activo !== undefined
                ? activo
                : cliente.activo
        });

        return res.json({
            message: 'Cliente actualizado correctamente',
            cliente
        });

    } catch (error) {

        console.error('Error al actualizar cliente:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

// DESACTIVAR CLIENTE
const desactivarCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);

        if (!cliente) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
            });
        }

        cliente.activo = false;

        await cliente.save();

        res.json({
            message: 'Cliente desactivado correctamente'
        });

    } catch (error) {
        console.error('Error al desactivar cliente:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


module.exports = {
    crearCliente,
    listarClientes,
    obtenerCliente,
    actualizarCliente,
    desactivarCliente
};
