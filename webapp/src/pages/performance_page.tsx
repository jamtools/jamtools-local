import React from 'react';

import {useGlobalState} from '../hooks/use_global_state';

import ControlPanel from '../components/control_panel/control_panel';

import ProgressionView from '../components/progression_view/progression_view';

export default function PerformancePage() {
    const {
        messages,
    } = useGlobalState();

    const content = (
        <ControlPanel/>
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
