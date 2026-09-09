'use strict';

const {
    Cliente,
    CumpleanosNotificacion
} = require('../models');

const {
    obtenerIO
} = require('../socketServer/socket');

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * utilizando la zona horaria local del servidor.
 */
const obtenerFechaActual = () => {
    const ahora = new Date();

    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Tegucigalpa'
    }).format(ahora);
};

/**
 * Convierte una fecha YYYY-MM-DD a objeto Date
 * evitando problemas de zona horaria.
 */
const convertirFecha = (fecha) => {
    const [anio, mes, dia] = fecha.split('-').map(Number);

    return new Date(anio, mes - 1, dia);
};

/**
 * Obtiene el próximo cumpleaños de un cliente.
 *
 * No importa el año en que nació la niña.
 * Solamente se utiliza el día y el mes.
 */
const obtenerProximoCumpleanos = (fechaNacimiento, fechaActual) => {

    const nacimiento = convertirFecha(fechaNacimiento);
    const hoy = convertirFecha(fechaActual);

    let anio = hoy.getFullYear();

    let proximo = new Date(
        anio,
        nacimiento.getMonth(),
        nacimiento.getDate()
    );

    // Si el cumpleaños de este año ya pasó,
    // utilizar el próximo año.
    if (proximo < hoy) {
        anio++;

        proximo = new Date(
            anio,
            nacimiento.getMonth(),
            nacimiento.getDate()
        );
    }

    return proximo;
};

/**
 * Calcula la cantidad de días entre dos fechas.
 */
const calcularDiasDiferencia = (fecha1, fecha2) => {

    const diferencia =
        fecha2.getTime() - fecha1.getTime();

    return Math.round(
        diferencia / (1000 * 60 * 60 * 24)
    );
};

/**
 * Busca clientes cuyo próximo cumpleaños
 * sea exactamente dentro de 14 días.
 */
const obtenerCumpleanosProximos = async () => {

    const fechaActual = obtenerFechaActual();

    const hoy = convertirFecha(fechaActual);

    const clientes = await Cliente.findAll({
        where: {
            activo: true
        }
    });

    const clientesCumpleanos = [];

    for (const cliente of clientes) {

        if (!cliente.fecha_nacimiento) {
            continue;
        }

        const proximoCumpleanos =
            obtenerProximoCumpleanos(
                cliente.fecha_nacimiento,
                fechaActual
            );

        const diasRestantes =
            calcularDiasDiferencia(
                hoy,
                proximoCumpleanos
            );

        if (diasRestantes === 14) {

            clientesCumpleanos.push({
                cliente,
                fechaCumpleanos: proximoCumpleanos,
                diasRestantes
            });
        }
    }

    return clientesCumpleanos;
};

/**
 * Procesa los cumpleaños próximos
 * y crea las notificaciones correspondientes.
 */
const procesarCumpleanos = async () => {

    const clientes =
        await obtenerCumpleanosProximos();

    let notificacionesCreadas = 0;

    for (const item of clientes) {

        const {
            cliente,
            fechaCumpleanos
        } = item;

        const anioCumpleanos =
            fechaCumpleanos.getFullYear();

        const fechaCumpleanosString =
            `${anioCumpleanos}-${String(
                fechaCumpleanos.getMonth() + 1
            ).padStart(2, '0')}-${String(
                fechaCumpleanos.getDate()
            ).padStart(2, '0')}`;

        const existente =
            await CumpleanosNotificacion.findOne({
                where: {
                    cliente_id: cliente.id,
                    anio_cumpleanos: anioCumpleanos
                }
            });

        if (existente) {
            continue;
        }

   const notificacion =
    await CumpleanosNotificacion.create({

        cliente_id: cliente.id,

        anio_cumpleanos:
            anioCumpleanos,

        fecha_cumpleanos:
            fechaCumpleanosString,

        estado: 'PENDIENTE'
    });

const io = obtenerIO();

io.emit('nuevo_cumpleanos', {
    id: notificacion.id,
    cliente_id: cliente.id,
    anio_cumpleanos: anioCumpleanos,
    fecha_cumpleanos: fechaCumpleanosString,
    estado: 'PENDIENTE',
    cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        correo: cliente.correo
    }
});

        notificacionesCreadas++;
    }

    return {
        clientesDetectados: clientes.length,
        notificacionesCreadas
    };
};

module.exports = {
    obtenerCumpleanosProximos,
    procesarCumpleanos
};