
import {ControlPanelActions} from '@shared/actions/control_panel_actions';
import {GetStateAPIResponse, SetConfigAPIResponse, SubmitControlPanelActionAPIResponse} from '@shared/types/api_types';

import type {subscribeToMessages} from '../websocket/websocket_client';
import {Config} from '@shared/types/config_types/config_types';

export interface ActionHandler {
    submitControlPanelAction(actionName: ControlPanelActions): Promise<SubmitControlPanelActionAPIResponse>;
    fetchGlobalState(): Promise<GetStateAPIResponse>;
    setConfig(config: Config): Promise<SetConfigAPIResponse>;
    subscribeToMessages: typeof subscribeToMessages;
}

export enum ActionHandlerType {
    LOCAL = 'local',
    REMOTE = 'remote',
}
