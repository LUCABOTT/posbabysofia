'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CumpleanosNotificacion extends Model {
        static associate(models) {
            CumpleanosNotificacion.belongsTo(models.Cliente, {
                foreignKey: 'cliente_id',
                as: 'cliente'
            });
        }
    }

    CumpleanosNotificacion.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },

            cliente_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            anio_cumpleanos: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            fecha_cumpleanos: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },

            fecha_notificacion: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },

            estado: {
                type: DataTypes.ENUM(
                    'PENDIENTE',
                    'CORREO_ENVIADO',
                    'IGNORADO'
                ),
                allowNull: false,
                defaultValue: 'PENDIENTE'
            },

            fecha_envio: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: 'CumpleanosNotificacion',
            tableName: 'cumpleanos_notificaciones',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    return CumpleanosNotificacion;
};