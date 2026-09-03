'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('productos', 'imagen', {
            type: Sequelize.STRING(255),
            allowNull: true
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('productos', 'imagen');
    }
};