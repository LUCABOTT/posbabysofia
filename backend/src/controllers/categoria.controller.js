const { Categoria, Producto } = require('../models');

const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll({
            order: [['id', 'ASC']]
        });

        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

const obtenerCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                message: 'Categoría no encontrada'
            });
        }

        res.json(categoria);
    } catch (error) {
        console.error('Error al obtener categoría:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

const crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                message: 'El nombre es obligatorio'
            });
        }

        const existente = await Categoria.findOne({
            where: { nombre: nombre.trim() }
        });

        if (existente) {
            return res.status(409).json({
                message: 'La categoría ya existe'
            });
        }

        const categoria = await Categoria.create({
            nombre: nombre.trim(),
            descripcion: descripcion || null
        });

        res.status(201).json(categoria);
    } catch (error) {
        console.error('Error al crear categoría:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

const actualizarCategoria = async (req, res) => {
    try {
        const { nombre, descripcion, activo } = req.body;

        const categoria = await Categoria.findByPk(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                message: 'Categoría no encontrada'
            });
        }

        if (nombre !== undefined) {
            if (!nombre.trim()) {
                return res.status(400).json({
                    message: 'El nombre es obligatorio'
                });
            }

            categoria.nombre = nombre.trim();
        }

        if (descripcion !== undefined) {
            categoria.descripcion = descripcion;
        }

        if (activo !== undefined) {
            categoria.activo = activo;
        }

        await categoria.save();

        res.json(categoria);
    } catch (error) {
        console.error('Error al actualizar categoría:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

const eliminarCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                message: 'Categoría no encontrada'
            });
        }

        categoria.activo = false;
        await categoria.save();

        res.json({
            message: 'Categoría desactivada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

const eliminarCategoriaDefinitiva = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                message: 'Categoría no encontrada'
            });
        }

        const productosAsociados = await Producto.count({
            where: { categoria_id: categoria.id }
        });

        if (productosAsociados > 0) {
            return res.status(409).json({
                message: 'No se puede eliminar definitivamente una categoría con productos asociados'
            });
        }

        await categoria.destroy();

        res.json({
            message: 'Categoría eliminada definitivamente'
        });
    } catch (error) {
        console.error('Error al eliminar categoría definitivamente:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    obtenerCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    eliminarCategoriaDefinitiva
};
