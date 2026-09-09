'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('productos', 'descuento_tipo', {
            type: Sequelize.ENUM('PORCENTAJE', 'MONTO'),
            allowNull: true,
            defaultValue: null
        });

        await queryInterface.addColumn('productos', 'descuento_valor', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        });

        await queryInterface.addColumn('productos', 'descuento_inicio', {
            type: Sequelize.DATEONLY,
            allowNull: true
        });

        await queryInterface.addColumn('productos', 'descuento_fin', {
            type: Sequelize.DATEONLY,
            allowNull: true
        });

        await queryInterface.addColumn('productos', 'descuento_activo', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('productos', 'descuento_activo');
        await queryInterface.removeColumn('productos', 'descuento_fin');
        await queryInterface.removeColumn('productos', 'descuento_inicio');
        await queryInterface.removeColumn('productos', 'descuento_valor');
        await queryInterface.removeColumn('productos', 'descuento_tipo');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_productos_descuento_tipo";');
    }
};