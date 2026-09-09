'use strict';

const { Server } = require('socket.io');

let io = null;

const inicializarSocket = (server, frontendOrigin) => {
    io = new Server(server, {
        cors: {
            origin: frontendOrigin,
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(
            `Cliente conectado a Socket.IO: ${socket.id}`
        );

        socket.on('disconnect', () => {
            console.log(
                `Cliente desconectado de Socket.IO: ${socket.id}`
            );
        });
    });

    return io;
};

const obtenerIO = () => {
    if (!io) {
        throw new Error(
            'Socket.IO no ha sido inicializado'
        );
    }

    return io;
};

module.exports = {
    inicializarSocket,
    obtenerIO
};