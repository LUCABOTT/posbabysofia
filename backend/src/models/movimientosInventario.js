'use strict';

module.exports = (sequelize, DataTypes) => {
    const MovimientoInventario = sequelize.define(
        'MovimientoInventario',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },

            producto_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            tipo: {
                type: DataTypes.ENUM(
                    'ENTRADA',
                    'SALIDA',
                    'AJUSTE'
                ),
                allowNull: false
            },

            cantidad: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            stock_anterior: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            stock_nuevo: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            motivo: {
                type: DataTypes.STRING(255),
                allowNull: true
            }
        },
        {
            tableName: 'movimientos_inventario',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false
        }
    );

    MovimientoInventario.associate = (models) => {
        MovimientoInventario.belongsTo(models.Producto, {
            foreignKey: 'producto_id',
            as: 'producto'
        });

        MovimientoInventario.belongsTo(models.User, {
            foreignKey: 'usuario_id',
            as: 'usuario'
        });
    };

    return MovimientoInventario;
};