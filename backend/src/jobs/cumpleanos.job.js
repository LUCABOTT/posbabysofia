'use strict';

const cron = require('node-cron');

const {
    procesarCumpleanos
} = require('../services/cumpleanos.service');

const iniciarCumpleanosJob = () => {

    cron.schedule(
        '0 8 * * *',
        async () => {

            console.log(
                '[CRON] Revisando cumpleaños próximos...'
            );

            try {

                const resultado =
                    await procesarCumpleanos();

                console.log(
                    '[CRON] Cumpleaños procesados:',
                    resultado
                );

            } catch (error) {

                console.error(
                    '[CRON] Error procesando cumpleaños:',
                    error
                );
            }
        },
        {
            timezone: 'America/Tegucigalpa'
        }
    );

    console.log(
        '[CRON] Job de cumpleaños iniciado.'
    );
};

module.exports = iniciarCumpleanosJob;