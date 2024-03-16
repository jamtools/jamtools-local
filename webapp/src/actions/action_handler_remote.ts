import {Config} from '@shared/types/config_types/config_types';

import {ControlPanelActions, SerializedAction} from '../../../shared/actions/control_panel_actions';
import {SubmitControlPanelActionAPIResponse, GetStateAPIResponse, SetConfigAPIResponse, SetConfigAPIRequest} from '../../../shared/types/api_types';

import {subscribeToMessages, WebsocketMessage} from '../websocket/websocket_client';

import type {ActionHandler} from './app_actions';

type ImportMeta = {
    env: {
        API_HOST?: string;
    };
}

const apiHost = process.env.API_HOST;
const host = apiHost || `http://${window.location.hostname}:1337`;

export class RemoteActionHandler implements ActionHandler {
    subscribeToMessages = (callback: (msg: WebsocketMessage<unknown>) => void) => {
        return subscribeToMessages(callback);
    };

    setConfig = async (config: Config): Promise<SetConfigAPIResponse> => {
        const body: SetConfigAPIRequest = {
            config,
        };

        let res;
        try {
            res = await fetch(host + '/config', {
                body: JSON.stringify(body),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (e: unknown) {
            const e2 = e as Error;
            return {error: e2.message};
        }

        return res.json();
    };

    submitControlPanelAction = async (actionName: ControlPanelActions): Promise<SubmitControlPanelActionAPIResponse> => {
        const action: SerializedAction = {
            action: actionName,
        };

        let res;
        try {
            res = await fetch(host + '/action', {
                body: JSON.stringify(action),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (e: unknown) {
            const e2 = e as Error;
            return {error: e2.message};
        }

        return res.json();
    };

    fetchGlobalState = async (): Promise<GetStateAPIResponse> => {
        let res;
        try {
            res = await fetch(host + '/state', {
                method: 'GET',
            });
        } catch (e: unknown) {
            const e2 = e as Error;
            return {error: e2.message};
        }

        return res.json();
    };
}
