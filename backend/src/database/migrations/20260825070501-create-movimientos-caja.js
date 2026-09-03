'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'movimientos_caja',
            'venta_id',
            {
                type: Sequelize.BIGINT,
                allowNull: true,
                references: {
                    model: 'ventas',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.removeColumn(
            'movimientos_caja',
            'venta_id'
        );
    }
};