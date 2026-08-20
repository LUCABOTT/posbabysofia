'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detalle_ventas', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
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

      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      descuento: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable('detalle_ventas');
  }
};