'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos_inventario', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },

      producto_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'productos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
          'ENTRADA',
          'SALIDA',
          'AJUSTE'
        ),
        allowNull: false
      },

      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      stock_anterior: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      stock_nuevo: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      motivo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('movimientos_inventario');
  }
};