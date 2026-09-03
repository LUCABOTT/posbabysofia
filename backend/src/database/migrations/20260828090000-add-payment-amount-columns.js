'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const pagos = await queryInterface.describeTable('pagos');

    if (!pagos.monto_recibido) {
      await queryInterface.addColumn('pagos', 'monto_recibido', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    if (!pagos.cambio) {
      await queryInterface.addColumn('pagos', 'cambio', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pagos', 'cambio');
    await queryInterface.removeColumn('pagos', 'monto_recibido');
  }
};