'use strict';

module.exports = (sequelize, DataTypes) => {
    const Cliente = sequelize.define(
        'Cliente',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },

            nombre: {
                type: DataTypes.STRING(150),
                allowNull: false
            },

            email: {
                type: DataTypes.STRING(150),
                allowNull: true,
                unique: true,
                validate: {
                    isEmail: true
                }
            },

            telefono: {
                type: DataTypes.STRING(30),
                allowNull: true
            },

            fecha_nacimiento: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },

            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            tableName: 'clientes',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    // Asociación Cliente -> Ventas
    Cliente.associate = (models) => {

        Cliente.hasMany(models.Venta, {
            foreignKey: 'cliente_id',
            as: 'ventas'
        });

    };

    return Cliente;
};