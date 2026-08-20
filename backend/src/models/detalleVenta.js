'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class DetalleVenta extends Model {

        static associate(models) {

            DetalleVenta.belongsTo(models.Venta, {
                foreignKey: 'venta_id',
                as: 'venta'
            });

            DetalleVenta.belongsTo(models.Producto, {
                foreignKey: 'producto_id',
                as: 'producto'
            });
        }
    }

    DetalleVenta.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },

            venta_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            producto_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            cantidad: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            precio_unitario: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },

            descuento: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            subtotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: 'DetalleVenta',
            tableName: 'detalle_ventas',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    return DetalleVenta;
};