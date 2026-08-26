'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {

        await queryInterface.createTable('movimientos_caja', {

            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            caja_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'cajas',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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

            tipo: {
                type: Sequelize.ENUM(
                    'INGRESO',
                    'EGRESO'
                ),
                allowNull: false
            },

            monto: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },

            motivo: {
                type: Sequelize.STRING(255),
                allowNull: false
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

        await queryInterface.dropTable('movimientos_caja');

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_movimientos_caja_tipo";'
        );

    }
};