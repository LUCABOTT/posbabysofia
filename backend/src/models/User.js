'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, {
        foreignKey: 'rol_id',
        as: 'rol'
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },

      rol_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },

      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true
    }
  );

  return User;
};