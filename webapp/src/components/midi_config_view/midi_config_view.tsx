import React from 'react';

import {useGlobalState} from 'src/hooks/use_global_state';

import {MidiInputConfig} from '@shared/types/config_types/config_types';

import {ConfigState} from '@shared/state/config_state';

import MidiInputForm from './midi_input_form';

export default function MidiConfigView() {
    const {
        globalState,
        actionHandler,
    } = useGlobalState();

    if (!globalState) {
        return (
            <div>
                Fetching global state
            </div>
        );
    }

    const submitMidiInputConfigForm = (instrument: MidiInputConfig) => {
        const inputs = globalState.config.midi.inputs;
        const index = inputs.findIndex((i) => i.name === instrument.name);
        const newArr = [...inputs.slice(0, index), instrument, ...inputs.slice(index + 1)];
        const config: ConfigState = {
            ...globalState.config,
            midi: {
                ...globalState.config.midi,
                inputs: newArr,
            },
        };

        actionHandler.setConfig(config);
    };

    const inputs = globalState.config.midi.inputs.map((instrument, i) => (
        <div key={instrument.name}>
            <h2>
                {i + 1}. {instrument.name}
            </h2>
            <MidiInputForm
                instrument={instrument}
                submit={(instrument) => submitMidiInputConfigForm(instrument)}
            />
        </div>
    ));

    return (
        <div>
            Time to config the midi
            <div>
                {inputs}
            </div>
        </div>
    );
}
