'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Producto extends Model {
        static associate(models) {
            // Un producto pertenece a una categoría
            Producto.belongsTo(models.Categoria, {
                foreignKey: 'categoria_id',
                as: 'categoria'
            });

        // Un producto puede aparecer en muchos detalles de venta
        Producto.hasMany(models.DetalleVenta, {
            foreignKey: 'producto_id',
            as: 'detallesVenta'
        });

        Producto.hasMany(models.MovimientoInventario, {
            foreignKey: 'producto_id',
            as: 'movimientosInventario'
        });

        }
    }

    Producto.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },

            categoria_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            codigo: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },

            nombre: {
                type: DataTypes.STRING(150),
                allowNull: false
            },

            imagen: {
                type: DataTypes.STRING(255),
                allowNull: true
            },

            descripcion: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            precio_compra: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            precio_venta: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },

            stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },

            stock_minimo: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },

            descuento_tipo: {
                type: DataTypes.ENUM('PORCENTAJE', 'MONTO'),
                allowNull: true,
                defaultValue: null
            },

            descuento_valor: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            descuento_inicio: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },

            descuento_fin: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },

            descuento_activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },

            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            sequelize,
            modelName: 'Producto',
            tableName: 'productos',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    Producto.prototype.tieneDescuentoVigente = function () {
        if (!this.descuento_tipo || !this.descuento_activo) return false;
        if (Number(this.descuento_valor) <= 0) return false;

        const hoy = new Date().toISOString().slice(0, 10);

        if (this.descuento_inicio && hoy < this.descuento_inicio) return false;
        if (this.descuento_fin && hoy > this.descuento_fin) return false;

        return true;
    };

    Producto.prototype.calcularPrecioFinal = function () {
        const precioVenta = Number(this.precio_venta);

        if (!this.tieneDescuentoVigente()) return precioVenta;

        const valor = Number(this.descuento_valor);
        const precioFinal = this.descuento_tipo === 'PORCENTAJE'
            ? precioVenta - (precioVenta * valor / 100)
            : precioVenta - valor;

        return Math.max(0, Number(precioFinal.toFixed(2)));
    };

    return Producto;
};