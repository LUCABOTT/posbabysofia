const { Producto, Categoria } = require('../models');
const fs = require('fs');
const path = require('path');

const CARPETA_DESTINO = path.join(__dirname, '..', '..', 'uploads', 'productos');

// Helper para borrar un archivo de imagen de forma segura
const borrarImagen = (rutaImagen) => {
    if (!rutaImagen) return;

    const nombreArchivo = path.basename(rutaImagen);
    const rutaCompleta = path.join(CARPETA_DESTINO, nombreArchivo);

    fs.unlink(rutaCompleta, (error) => {
        if (error && error.code !== 'ENOENT') {
            console.error('Error al borrar imagen:', error);
        }
    });
};


// ==============================
// LISTAR PRODUCTOS
// ==============================
const listarProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['id', 'ASC']]
        });

        res.json(productos);

    } catch (error) {
        console.error('Error al listar productos:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// OBTENER PRODUCTO
// ==============================
const obtenerProducto = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id, {
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                }
            ]
        });

        if (!producto) {
            return res.status(404).json({
                message: 'Producto no encontrado'
            });
        }

        res.json(producto);

    } catch (error) {
        console.error('Error al obtener producto:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// CREAR PRODUCTO
// ==============================
const crearProducto = async (req, res) => {
    try {
        const {
            categoria_id,
            codigo,
            nombre,
            descripcion,
            precio_compra,
            precio_venta,
            stock,
            stock_minimo
        } = req.body;

        if (
            !categoria_id ||
            !codigo ||
            !nombre ||
            precio_venta === undefined
        ) {
            if (req.file) borrarImagen(req.file.filename);

            return res.status(400).json({
                message: 'categoria_id, codigo, nombre y precio_venta son obligatorios'
            });
        }

        const categoria = await Categoria.findByPk(categoria_id);

        if (!categoria) {
            if (req.file) borrarImagen(req.file.filename);

            return res.status(400).json({
                message: 'La categoría no existe'
            });
        }

        if (!categoria.activo) {
            if (req.file) borrarImagen(req.file.filename);

            return res.status(400).json({
                message: 'No se puede crear un producto en una categoría inactiva'
            });
        }

        const productoExistente = await Producto.findOne({
            where: { codigo }
        });

        if (productoExistente) {
            if (req.file) borrarImagen(req.file.filename);

            return res.status(409).json({
                message: 'Ya existe un producto con ese código'
            });
        }

        const producto = await Producto.create({
            categoria_id,
            codigo,
            nombre,
            descripcion,
            precio_compra: precio_compra ?? 0,
            precio_venta,
            stock: stock ?? 0,
            stock_minimo: stock_minimo ?? 0,
            imagen: req.file
                ? `/uploads/productos/${req.file.filename}`
                : null
        });

        res.status(201).json({
            message: 'Producto creado correctamente',
            producto
        });

    } catch (error) {
        if (req.file) borrarImagen(req.file.filename);

        console.error('Error al crear producto:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// ACTUALIZAR PRODUCTO
// ==============================
const actualizarProducto = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);

        if (!producto) {
            if (req.file) borrarImagen(req.file.filename);

            return res.status(404).json({
                message: 'Producto no encontrado'
            });
        }

        const {
            categoria_id,
            codigo,
            nombre,
            descripcion,
            precio_compra,
            precio_venta,
            stock,
            stock_minimo,
            activo
        } = req.body;

        let categoria = null;

        if (categoria_id !== undefined) {
            categoria = await Categoria.findByPk(categoria_id);

            if (!categoria) {
                if (req.file) borrarImagen(req.file.filename);

                return res.status(400).json({
                    message: 'La categoría no existe'
                });
            }
        }

        if (categoria_id !== undefined && !categoria.activo) {
            if (req.file) borrarImagen(req.file.filename);

            return res.status(400).json({
                message: 'No se puede asignar un producto a una categoría inactiva'
            });
        }

        if (codigo !== undefined && codigo !== producto.codigo) {
            const existente = await Producto.findOne({
                where: { codigo }
            });

            if (existente) {
                if (req.file) borrarImagen(req.file.filename);

                return res.status(409).json({
                    message: 'Ya existe otro producto con ese código'
                });
            }
        }

        // Si sube una imagen nueva, borramos la anterior
        const imagenAnterior = producto.imagen;
        const nuevaImagen = req.file
            ? `/uploads/productos/${req.file.filename}`
            : producto.imagen;

        await producto.update({
            categoria_id,
            codigo,
            nombre,
            descripcion,
            precio_compra,
            precio_venta,
            stock,
            stock_minimo,
            activo,
            imagen: nuevaImagen
        });

        if (req.file && imagenAnterior) {
            borrarImagen(imagenAnterior);
        }

        res.json({
            message: 'Producto actualizado correctamente',
            producto
        });

    } catch (error) {
        if (req.file) borrarImagen(req.file.filename);

        console.error('Error al actualizar producto:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// ELIMINAR PRODUCTO (BORRADO LÓGICO)
// ==============================
const eliminarProducto = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({
                message: 'Producto no encontrado'
            });
        }

        // No eliminamos físicamente el producto ni su imagen.
        // Lo desactivamos para conservar el historial.
        await producto.update({
            activo: false
        });

        res.json({
            message: 'Producto desactivado correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar producto:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


// ==============================
// ELIMINAR PRODUCTO (DEFINITIVO)
// ==============================
const eliminarProductoDefinitivo = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({
                message: 'Producto no encontrado'
            });
        }

        const imagenAnterior = producto.imagen;

        await producto.destroy();

        if (imagenAnterior) {
            borrarImagen(imagenAnterior);
        }

        res.json({
            message: 'Producto eliminado definitivamente'
        });

    } catch (error) {
        console.error('Error al eliminar producto definitivamente:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};


module.exports = {
    listarProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    eliminarProductoDefinitivo
};