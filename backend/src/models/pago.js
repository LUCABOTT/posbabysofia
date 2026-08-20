'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Pago extends Model {
        static associate(models) {
            Pago.belongsTo(models.Venta, {
                foreignKey: 'venta_id',
                as: 'venta'
            });
        }
    }

    Pago.init(
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

            metodo: {
                type: DataTypes.ENUM(
                    'EFECTIVO',
                    'TARJETA',
                    'TRANSFERENCIA'
                ),
                allowNull: false
            },

            monto: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },

            referencia: {
                type: DataTypes.STRING(100),
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: 'Pago',
            tableName: 'pagos',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    return Pago;
};