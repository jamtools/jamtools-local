import React, {useEffect, useMemo, useState, createContext, useContext} from 'react';

import {isErrorResponse} from '@shared/types/api_types';

import {GlobalState} from '@shared/state/global_state';

import {WebsocketMessage} from '../websocket/websocket_client';
import type {ActionHandler} from '../actions/app_actions';

type GlobalStateContextValue = {
    messages: Array<WebsocketMessage<unknown>>;
    globalState: GlobalState | null;
    actionHandler: ActionHandler;
    localMode: boolean;
}

const defaultActionHandler = {} as unknown as ActionHandler;

export const contextInstance = createContext<GlobalStateContextValue>({
    messages: [],
    globalState: null,
    actionHandler: defaultActionHandler,
    localMode: false,
});

export const useGlobalState = (): GlobalStateContextValue => {
    const value = useContext(contextInstance);
    return value;
};

export type GlobalStateProviderProps = React.PropsWithChildren<{
    actionHandler: ActionHandler;
    localMode: boolean;
}>;

export const GlobalStateProvider = (props: GlobalStateProviderProps) => {
    const [messages, setMessages] = useState<Array<WebsocketMessage<unknown>>>([]);
    const [globalState, setGlobalState] = useState<GlobalState | null>(null);

    useEffect(() => {
        props.actionHandler.subscribeToMessages((msg) => {
            setMessages((messages) => {
                return [...messages, msg];
            });

            setGlobalState((msg as {data: GlobalState}).data);
        });
    }, []);

    useEffect(() => {
        props.actionHandler.fetchGlobalState().then((res) => {
            if (isErrorResponse(res)) {
                if (res.error !== 'Failed to fetch') {
                    alert(res.error);
                }
                return;
            }

            setGlobalState(res.data);
        });
    }, []);

    const value = useMemo(() => ({
        messages,
        setMessages,
        globalState,
        setGlobalState,
        actionHandler: props.actionHandler,
        localMode: props.localMode,
    }), [messages, globalState]);

    return (
        <contextInstance.Provider value={value}>
            {props.children}
        </contextInstance.Provider>
    );
};
