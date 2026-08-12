'use strict';

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('roles', [
            {
                nombre: 'SUPER_ADMIN',
                descripcion: 'Acceso total al sistema',
                activo: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                nombre: 'ADMIN',
                descripcion: 'Administrador del sistema',
                activo: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                nombre: 'CAJERO',
                descripcion: 'Usuario encargado de las operaciones de caja',
                activo: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('roles', {
            nombre: {
                [queryInterface.sequelize.Sequelize.Op.in]: [
                    'SUPER_ADMIN',
                    'ADMIN',
                    'CAJERO'
                ]
            }
        });
    }
};