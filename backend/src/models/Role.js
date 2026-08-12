'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
            // Relaciones futuras
        }
    }

    Role.init(
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            nombre: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },

            descripcion: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            sequelize,
            modelName: 'Role',
            tableName: 'roles',
            underscored: true,
            timestamps: true
        }
    );

    return Role;
};