
import {ControlPanelActions} from '@shared/actions/control_panel_actions';
import {GetStateAPIResponse, SubmitControlPanelActionAPIResponse} from '@shared/types/api_types';

import type {subscribeToMessages} from '../websocket/websocket_client';

export interface ActionHandler {
    submitControlPanelAction(actionName: ControlPanelActions): Promise<SubmitControlPanelActionAPIResponse>;
    fetchGlobalState(): Promise<GetStateAPIResponse>;
    subscribeToMessages: typeof subscribeToMessages;
}

export enum ActionHandlerType {
    LOCAL = 'local',
    REMOTE = 'remote',
}
