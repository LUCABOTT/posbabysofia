'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('pagos', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            venta_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'ventas',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            metodo: {
                type: Sequelize.ENUM(
                    'EFECTIVO',
                    'TARJETA',
                    'TRANSFERENCIA'
                ),
                allowNull: false
            },

            monto: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },

            referencia: {
                type: Sequelize.STRING(100),
                allowNull: true
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('pagos');

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_pagos_metodo";'
        );
    }
};