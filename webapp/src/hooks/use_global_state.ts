import {useEffect, useMemo, useState} from 'react';

import {WebsocketMessage} from '../websocket/websocket_client';
import type {ActionHandler} from '../actions/app_actions';
import {isErrorResponse} from '@shared/types/api_types';
import {GlobalState} from '@shared/state/global_state';

export const useGlobalState = (actionHandler: ActionHandler) => {
    const [messages, setMessages] = useState<WebsocketMessage<any>[]>([]);
    const [globalState, setGlobalState] = useState<GlobalState | null>(null);

    useEffect(() => {
        actionHandler.subscribeToMessages(msg => {
            setMessages(messages => {
                return [...messages, msg];
            });

            setGlobalState((msg as any).data);
        });
    }, []);

    useEffect(() => {
        actionHandler.fetchGlobalState().then((res) => {
            if (isErrorResponse(res)) {
                alert(res.error);
                return;
            }

            setGlobalState(res.data);
        });
    }, []);

    return useMemo(() => ({
        messages,
        setMessages,
        globalState,
        setGlobalState,
    }), [messages, globalState]);
}
