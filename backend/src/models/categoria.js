'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Categoria extends Model {
        static associate(models) {
            Categoria.hasMany(models.Producto, {
                foreignKey: 'categoria_id',
                as: 'productos'
            });
        }
    }

    Categoria.init(
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },

            nombre: {
                type: DataTypes.STRING(100),
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
            modelName: 'Categoria',
            tableName: 'categorias',
            underscored: true
        }
    );

    return Categoria;
};