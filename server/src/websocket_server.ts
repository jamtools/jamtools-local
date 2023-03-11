import express from 'express';
import http from 'http';

import io from 'socket.io';

export const initWebsocketServer = async (server: http.Server): Promise<io.Server> => {
    const ioServer = new io.Server(server, {
        cors: {
            origin: '*',
            methods: ["GET", "POST"]
        }
    });

    ioServer.on('connection', (socket) => {
        console.log('New connection to jam room.')
        socket.join('jam')

        // socket.on('message', (data) => {
        //     console.log('Websocket server received message:')
        //     console.log(JSON.stringify(data, null, 3))
        //     socket.to('jam').emit('message', data)
        // });
    });

    return ioServer;
};
