'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {

        await queryInterface.createTable('cajas', {

            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            usuario_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },

            fecha_apertura: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },

            fecha_cierre: {
                type: Sequelize.DATE,
                allowNull: true
            },

            monto_inicial: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            monto_esperado: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },

            monto_final: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },

            diferencia: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },

            estado: {
                type: Sequelize.ENUM(
                    'ABIERTA',
                    'CERRADA'
                ),
                allowNull: false,
                defaultValue: 'ABIERTA'
            },

            observaciones: {
                type: Sequelize.TEXT,
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
        await queryInterface.dropTable('cajas');

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_cajas_estado";'
        );
    }
};