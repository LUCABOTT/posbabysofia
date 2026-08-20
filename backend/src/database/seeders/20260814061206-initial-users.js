'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordSuperAdmin = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);
    const passwordAdmin = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await queryInterface.bulkInsert('users', [
      {
        nombre: 'Super Administrador',
        email: 'superadmin@posbabysofia.com',
        password: passwordSuperAdmin,
        rol_id: 1,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Administrador',
        email: 'admin@posbabysofia.com',
        password: passwordAdmin,
        rol_id: 2,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'superadmin@posbabysofia.com',
          'admin@posbabysofia.com'
        ]
      }
    });
  }
};