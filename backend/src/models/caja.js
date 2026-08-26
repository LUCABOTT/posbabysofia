'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Caja extends Model {

        static associate(models) {

            Caja.belongsTo(models.User, {
                foreignKey: 'usuario_id',
                as: 'usuario'
            });

            Caja.hasMany(models.MovimientoCaja, {
                foreignKey: 'caja_id',
                as: 'movimientos'
            });

        }

    }

    Caja.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },

            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            fecha_apertura: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },

            fecha_cierre: {
                type: DataTypes.DATE,
                allowNull: true
            },

            monto_inicial: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            monto_esperado: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },

            monto_final: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },

            diferencia: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },

            estado: {
                type: DataTypes.ENUM(
                    'ABIERTA',
                    'CERRADA'
                ),
                allowNull: false,
                defaultValue: 'ABIERTA'
            },

            observaciones: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: 'Caja',
            tableName: 'cajas',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    return Caja;
};