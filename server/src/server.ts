import express from 'express';
import cors from 'cors';

import {SerializedAction, getActionMap} from '@shared/actions/control_panel_actions';
import type App from '@shared/app';
import {GlobalState} from '@shared/state/global_state';
import {SubmitControlPanelActionAPIResponse, GetStateAPIResponse} from '@shared/types/api_types';
import {initWebsocketServer} from './websocket_server';

import http from 'http';

export default async function initServer(app: App): Promise<http.Server> {
    const server = express();

    const actions = getActionMap(app);

    server.use(express.json());
    server.use(cors({
        origin: [
            'http://localhost:1234',
            'http://localhost:2000',
            'http://192.168.0.137:2000',
            'http://192.168.1.142:2000',
            'http://jam.local',
            'http://jam.local:1337',
            'http://jam.local:2000',
            'http://localhost',
            '*',
        ],
    }));

    server.get<undefined, GetStateAPIResponse>('/state', (req, res) => {
        res.json({
            data: app.getState(),
        });
    });

    server.post<undefined, SubmitControlPanelActionAPIResponse, SerializedAction>('/action', async (req, res) => {
        const action = req.body.action;

        if (!actions[action]) {
            res.json({error: 'No action found for ' + action});
            return;
        }

        try {
            await Promise.resolve(actions[action]());
        } catch (e: any) {
            console.error(`Error running action ${action}: ` + e);

            res.json({
                error: e.message,
            })
            return;
        }

        const state = app.getState();
        app.broadcastState();

        res.json({
            data: state,
        });
    });

    const httpServer = http.createServer(server);
    const io = await initWebsocketServer(httpServer);

    app.subscribeToGlobalState((state: GlobalState) => {
        io.to('jam').emit('message', {
            data: state,
        });
    });

    return httpServer;
}
