import React, {useEffect, useState} from 'react';
import ControlPanel from './control_panel/control_panel';
import MidiView from './midi_view';
import WledView from './wled_view';

import {subscribeToMessages, WebsocketMessage} from '../websocket/websocket_client';
import {fetchGlobalState} from '../actions/remote_actions';
import {isErrorResponse} from '@shared/types/api_types';
import {GlobalState} from '@shared/state/global_state';

export default function Main() {
    const [messages, setMessages] = useState<WebsocketMessage<any>[]>([]);
    const [globalState, setGlobalState] = useState<GlobalState | null>(null);

    useEffect(() => {
        subscribeToMessages(msg => {
            setMessages(messages => {
                return [...messages, msg];
            });

            setGlobalState((msg as any).data);
        });
    }, []);

    useEffect(() => {
        fetchGlobalState().then((res) => {
            if (isErrorResponse(res)) {
                alert(res.error);
                return;
            }

            setGlobalState(res.data);
        });
    }, []);

    let content = (
        <ControlPanel
            globalState={globalState}
            setGlobalState={setGlobalState}
        />
    );

    // return (
    //     <WledView/>
    // );

    // return (
    //     <MidiView/>
    // );

    return (
        <div>
            <div>
                <pre>
                    {messages.length}
                </pre>
            </div>
            {content}
        </div>
    );
}
