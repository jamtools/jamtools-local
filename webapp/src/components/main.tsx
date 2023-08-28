import React from 'react';

import {ActionHandler} from '../actions/app_actions';

import {useGlobalState} from '../hooks/use_global_state';

import ControlPanel from './control_panel/control_panel';

import ProgressionView from './progression_view/progression_view';

type Props = {
    actionHandler: ActionHandler;
    // localMode: boolean;
}

export default function Main(props: Props) {
    const {
        messages,
        globalState,
        // setGlobalState,
    } = useGlobalState(props.actionHandler);

    const content = (
        <ControlPanel
            globalState={globalState}
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

    const progressionView = (
        <ProgressionView/>
    );

    return (
        <div>
            {progressionView}
            <div>
                <pre>
                    {messages.length}
                </pre>
            </div>
            {content}
        </div>
    );
}
