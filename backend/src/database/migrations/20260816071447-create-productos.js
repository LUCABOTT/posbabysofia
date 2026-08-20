'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('productos', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      categoria_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'categorias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },

      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false
      },

      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      precio_compra: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      precio_venta: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      stock_minimo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.dropTable('productos');
  }
};