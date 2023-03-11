import {ControlPanelActions, SerializedAction} from '@shared/actions/control_panel_actions';
import {SubmitControlPanelActionAPIResponse, GetStateAPIResponse} from '@shared/types/api_types';

type ImportMeta = {
    env: {
        API_HOST?: string;
    }
}

let apiHost = (import.meta as unknown as ImportMeta).env.API_HOST;
const host = apiHost || `http://${window.location.hostname}:1337`;

export const submitControlPanelAction = (actionName: ControlPanelActions): Promise<SubmitControlPanelActionAPIResponse> => {
    const action: SerializedAction = {
        action: actionName,
    };

    return fetch(host + '/action', {
        body: JSON.stringify(action),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(r => r.json());
}

export const fetchGlobalState = (): Promise<GetStateAPIResponse> => {
    return fetch(host + '/state', {
        method: 'GET',
    }).then(r => r.json());
}
