'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('cumpleanos_notificaciones', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            cliente_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'clientes',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            anio_cumpleanos: {
                type: Sequelize.INTEGER,
                allowNull: false
            },

            fecha_cumpleanos: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },

            fecha_notificacion: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },

            estado: {
                type: Sequelize.ENUM(
                    'PENDIENTE',
                    'CORREO_ENVIADO',
                    'IGNORADO'
                ),
                allowNull: false,
                defaultValue: 'PENDIENTE'
            },

            fecha_envio: {
                type: Sequelize.DATE,
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

        await queryInterface.addConstraint(
            'cumpleanos_notificaciones',
            {
                fields: ['cliente_id', 'anio_cumpleanos'],
                type: 'unique',
                name: 'unique_cliente_anio_cumpleanos'
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable('cumpleanos_notificaciones');
    }
};