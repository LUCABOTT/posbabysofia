const { Producto, Categoria } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const validarDescuento = ({ descuento_tipo, descuento_valor, descuento_inicio, descuento_fin }, precioVenta) => {
    if (!descuento_tipo) return null;

    if (!['PORCENTAJE', 'MONTO'].includes(descuento_tipo)) {
        return 'descuento_tipo inválido';
    }

    const valor = Number(descuento_valor);

    if (!Number.isFinite(valor) || valor <= 0) {
        return 'descuento_valor debe ser mayor a 0 cuando se define un tipo de descuento';
    }

    if (descuento_tipo === 'PORCENTAJE' && valor > 100) {
        return 'El descuento porcentual no puede ser mayor a 100';
    }

    if (descuento_tipo === 'MONTO' && precioVenta !== undefined && valor >= Number(precioVenta)) {
        return 'El descuento en monto no puede ser mayor o igual al precio de venta';
    }

    if (descuento_inicio && descuento_fin && descuento_inicio > descuento_fin) {
        return 'descuento_inicio no puede ser posterior a descuento_fin';
    }

    return null;
};

const serializarProducto = (producto) => ({
    ...producto.toJSON(),
    precio_final: producto.calcularPrecioFinal(),
    descuento_vigente: producto.tieneDescuentoVigente()
});

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

        res.json(productos.map(serializarProducto));

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

        res.json(serializarProducto(producto));

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
            nombre,
            descripcion,
            precio_compra,
            precio_venta,
            stock,
            stock_minimo,
            descuento_tipo,
            descuento_valor,
            descuento_inicio,
            descuento_fin,
            descuento_activo
        } = req.body;

        if (
            !categoria_id ||
            !nombre ||
            precio_venta === undefined
        ) {
            if (req.file) borrarImagen(req.file.filename);

            return res.status(400).json({
                message: 'categoria_id, nombre y precio_venta son obligatorios'
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

        const errorDescuento = validarDescuento(
            { descuento_tipo, descuento_valor, descuento_inicio, descuento_fin },
            precio_venta
        );

        if (errorDescuento) {
            if (req.file) borrarImagen(req.file.filename);
            return res.status(400).json({ message: errorDescuento });
        }

        const productosConCodigo = await Producto.findAll({
            attributes: ['codigo'],
            where: {
                codigo: {
                    [Op.like]: 'PROD-%'
                }
            }
        });

        const ultimoNumero = productosConCodigo.reduce((mayor, producto) => {
            const coincidencia = /^PROD-(\d+)$/.exec(producto.codigo);
            const numero = coincidencia ? Number(coincidencia[1]) : 0;

            return Math.max(mayor, numero);
        }, 0);

        const codigo = `PROD-${ultimoNumero + 1}`;

        const producto = await Producto.create({
            categoria_id,
            codigo,
            nombre,
            descripcion,
            precio_compra: precio_compra ?? 0,
            precio_venta,
            stock: stock ?? 0,
            stock_minimo: stock_minimo ?? 0,
            descuento_tipo: descuento_tipo || null,
            descuento_valor: descuento_valor ?? 0,
            descuento_inicio: descuento_inicio || null,
            descuento_fin: descuento_fin || null,
            descuento_activo: descuento_activo !== undefined
                ? descuento_activo === 'true' || descuento_activo === true
                : true,
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
            activo,
            descuento_tipo,
            descuento_valor,
            descuento_inicio,
            descuento_fin,
            descuento_activo
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

        const errorDescuento = validarDescuento(
            { descuento_tipo, descuento_valor, descuento_inicio, descuento_fin },
            precio_venta ?? producto.precio_venta
        );

        if (errorDescuento) {
            if (req.file) borrarImagen(req.file.filename);
            return res.status(400).json({ message: errorDescuento });
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
            descuento_tipo,
            descuento_valor,
            descuento_inicio,
            descuento_fin,
            descuento_activo,
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