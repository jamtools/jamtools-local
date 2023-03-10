import React from 'react';
import ControlPanel from './control_panel/control_panel';
import MidiView from './midi_view';
import WledView from './wled_view';

export default function Main() {
    return (
        <ControlPanel/>
    );

    // return (
    //     <WledView/>
    // );

    return (
        <MidiView/>
    );

    // return <></>
}
