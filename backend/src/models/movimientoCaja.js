'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class MovimientoCaja extends Model {

        static associate(models) {

            MovimientoCaja.belongsTo(models.Caja, {
                foreignKey: 'caja_id',
                as: 'caja'
            });

            MovimientoCaja.belongsTo(models.User, {
                foreignKey: 'usuario_id',
                as: 'usuario'
            });

        }

    }

    MovimientoCaja.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },

            caja_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            tipo: {
                type: DataTypes.ENUM(
                    'INGRESO',
                    'EGRESO'
                ),
                allowNull: false
            },

            monto: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },

            motivo: {
                type: DataTypes.STRING(255),
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: 'MovimientoCaja',
            tableName: 'movimientos_caja',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    return MovimientoCaja;
};