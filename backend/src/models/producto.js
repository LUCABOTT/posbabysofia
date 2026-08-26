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

    return Producto;
};