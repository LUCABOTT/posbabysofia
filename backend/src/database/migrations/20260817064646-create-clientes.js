'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clientes', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },

      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false
      },

      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true
      },

      telefono: {
        type: Sequelize.STRING(30),
        allowNull: true
      },

      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('clientes');
  }
};