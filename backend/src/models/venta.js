'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Venta extends Model {

        static associate(models) {

            Venta.belongsTo(models.User, {
                foreignKey: 'usuario_id',
                as: 'usuario'
            });

            Venta.belongsTo(models.Cliente, {
                foreignKey: 'cliente_id',
                as: 'cliente'
            });

            Venta.hasMany(models.DetalleVenta, {
                foreignKey: 'venta_id',
                as: 'detalles'
            });

            Venta.hasMany(models.Pago, {
                foreignKey: 'venta_id',
                as: 'pagos'
            });

            Venta.hasOne(models.Factura, {
                foreignKey: 'venta_id',
                as: 'factura'
            });

            Venta.hasMany(models.MovimientoCaja, {
                foreignKey: 'venta_id',
                as: 'movimientosCaja'
            });
                    }
    }

    Venta.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },

            cliente_id: {
                type: DataTypes.BIGINT,
                allowNull: true
            },

            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },
            

            numero: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },

            subtotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },

            descuento: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            impuesto: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            total: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },

            estado: {
                type: DataTypes.ENUM(
                    'COMPLETADA',
                    'ANULADA',
                    'PENDIENTE'
                ),
                allowNull: false,
                defaultValue: 'COMPLETADA'
            }
        },
        {
            sequelize,
            modelName: 'Venta',
            tableName: 'ventas',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    return Venta;
};