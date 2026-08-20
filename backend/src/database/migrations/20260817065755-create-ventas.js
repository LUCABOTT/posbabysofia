'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ventas', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },

      cliente_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'clientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

      numero: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },

      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      descuento: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      impuesto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      estado: {
        type: Sequelize.ENUM(
          'COMPLETADA',
          'ANULADA'
        ),
        allowNull: false,
        defaultValue: 'COMPLETADA'
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
    await queryInterface.dropTable('ventas');
  }
};