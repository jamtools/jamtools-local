import React from 'react';
import {ActionHandler} from '../actions/app_actions';

import {useGlobalState} from '../hooks/use_global_state';

import ControlPanel from './control_panel/control_panel';

type Props = {
    actionHandler: ActionHandler;
    localMode: boolean;
}

export default function Main(props: Props) {
    const {
        messages,
        globalState,
        setGlobalState,
    } = useGlobalState(props.actionHandler);

    let content = (
        <ControlPanel
            globalState={globalState}
            setGlobalState={setGlobalState}
            actionHandler={props.actionHandler}
        />
    );

    // return (
    //     <WledView/>
    // );

    // return (
    //     <MidiView
    //          webMidi={webMidi}
    //     />
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
