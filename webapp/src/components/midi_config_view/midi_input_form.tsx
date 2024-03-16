import React, {useState, useEffect} from 'react';

import {MidiInputConfig} from '@shared/types/config_types/config_types';
import {ControlButtonMapping} from '@shared/types/trigger_types';

import ControlButtonEditor from './control_button_editor';

type Props = {
    instrument: MidiInputConfig;
    submit: (instrument: MidiInputConfig) => void;
};

export default function MidiInputForm({instrument, submit}: Props) {
    const [name, setName] = useState<string>(instrument.name);
    const [alias, setAlias] = useState<string | undefined>(instrument.alias);
    const [keyboardChannel, setKeyboardChannel] = useState<number | undefined>(instrument.keyboard?.channel);
    const [controlButtons, setControlButtons] = useState<{[name: string]: ControlButtonMapping | undefined}>(instrument.controlButtons || {});
    const [clock, setClock] = useState<boolean>(instrument.clock || false);
    const [sustainPedal, setSustainPedal] = useState<ControlButtonMapping | null>(instrument.sustainPedal || null);
    const [mainTrigger, setMainTrigger] = useState<ControlButtonMapping | null>(instrument.mainTrigger || null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        const mappings: MidiInputConfig = {
            name,
            alias: alias || undefined,
            keyboard: keyboardChannel === undefined ? undefined : {channel: keyboardChannel},
            controlButtons,
            clock,
            sustainPedal,
            mainTrigger,
        };

        submit(mappings);
    };

    useEffect(() => {
        // Handle prop changes and reinitialize state if necessary
        setName(instrument.name);
        setAlias(instrument.alias);
        setKeyboardChannel(instrument.keyboard?.channel);
        setControlButtons(instrument.controlButtons || {});
        setClock(instrument.clock || false);
        setSustainPedal(instrument.sustainPedal || null);
        setMainTrigger(instrument.mainTrigger || null);
    }, [instrument]);

    const updateControlMapping = (name: string, mapping: ControlButtonMapping) => {
        const mappings = {
            ...controlButtons,
            [name]: mapping,
        };
        setControlButtons(mappings);
    };

    const controlButtonComponents = Object.keys(controlButtons).map((name) => {
        const btn = controlButtons[name]!;
        return (
            <ControlButtonEditor
                key={name}
                buttonMapping={btn}
                buttonName={name}
                submit={(mapping) => updateControlMapping(name, mapping)}
            />
        );
    });

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <label>{name}</label>
            </div>

            <div>
                <label>Alias:</label>
                <input
                    type='text'
                    value={alias || ''}
                    onChange={(e) => setAlias(e.target.value)}
                />
            </div>

            <div>
                <label>Keyboard Channel:</label>
                <input
                    type='number'
                    value={keyboardChannel}
                    onChange={(e) => setKeyboardChannel(Number(e.target.value))}
                />
            </div>

            <div>
                {controlButtonComponents}
            </div>

            <div>
                <label>Clock:</label>
                <input
                    type='checkbox'
                    checked={clock}
                    onChange={(e) => setClock(e.target.checked)}
                />
            </div>

            {/* The sustainPedal and mainTrigger inputs can be similarly added as controlButtons */}

            <button type='submit'>Submit</button>
        </form>
    );
}

// type ControlButtonMapping = {
//     channel: number;
//     note: number;
// } | null;

// type MidiTriggerMappings = {
//     name: string;
//     alias?: string;
//     keyboard?: { channel: number };
//     controlButtons?: { [name: string]: ControlButtonMapping | undefined };
//     clock?: boolean;
//     sustainPedal?: ControlButtonMapping;
//     mainTrigger?: ControlButtonMapping;
// };
