import easymidi from 'easymidi';
import {WLEDClient} from 'wled-client';
import ProgressionModeManager from './application_mode_managers.ts/progression_mode_manager';

import {MidiInstrumentName} from './constants/midi_instrument_constants';
import {EasyMidi} from './types/easy_midi_types';
import {MidiInputMapper, ControlButtonMapping, KeyboardMapping, MidiTriggerMappings, MidiOutputMapper} from './types/trigger_types';

export default class App {
    private midiInputs: MidiInputMapper = {} as MidiInputMapper;
    private midiOutputs: easymidi.Output[] = [];
    private progressionMode: ProgressionModeManager;

    constructor(private midi: EasyMidi, private wled: WLEDClient | undefined) {
        this.progressionMode = new ProgressionModeManager(wled);
    }

    assignControlButtonTriggers = (midiName: MidiInstrumentName, buttons: ControlButtonMapping[]) => {
        const mapping = this.ensureMidiMapping(midiName);
        mapping.controlButtons = buttons;
    }

    assignKeyboardTrigger = (midiName: MidiInstrumentName, keyboard: KeyboardMapping) => {
        const mapping = this.ensureMidiMapping(midiName);
        mapping.keyboard = keyboard;
    }

    assignKeyboardOutput = (midiName: MidiInstrumentName) => {
        if (this.midiOutputs[midiName]) {
            return;
        }

        const instrument = new this.midi.Output(midiName);
        this.midiOutputs.push(instrument);
    }

    handleControlTrigger = (index: number) => {
        this.progressionMode.handleControlTrigger(index);
    }

    handleKeyboardTrigger = (msg: easymidi.Note) => {
        // const output = this.midiOutputs[0];
        this.midiOutputs.forEach(output => {
            if (msg.velocity === 0) {
                this.progressionMode.handleKeyboardNoteOff(msg, output);
                return;
            }

            this.progressionMode.handleKeyboardNoteOn(msg, output);
        });
    }

    handleNoteOn = (midiName: MidiInstrumentName, msg: easymidi.Note) => {
        const mapping = this.midiInputs[midiName];

        if (mapping.controlButtons?.length) {
            const index = mapping.controlButtons.findIndex(button => equalControlButton(button, msg));
            if (index !== -1) {
                const found = mapping.controlButtons[index];
                // console.log(`Found control mapping: ${midiName} ${index} ${JSON.stringify(found)} ${JSON.stringify(msg)}`);

                this.handleControlTrigger(index);
                return;
            }
        }

        if (mapping.keyboard && equalKeyboard(mapping.keyboard, msg)) {
            // console.log(`Found keyboard mapping: ${midiName} ${JSON.stringify(mapping.keyboard)} ${JSON.stringify(msg)}`);
            this.handleKeyboardTrigger(msg);
        }
    }

    handleNoteOff = (midiName: MidiInstrumentName, msg: easymidi.Note) => {
        const mapping = this.midiInputs[midiName];

        if (mapping.keyboard && equalKeyboard(mapping.keyboard, msg)) {
            // console.log(`Found keyboard mapping: ${midiName} ${JSON.stringify(mapping.keyboard)} ${JSON.stringify(msg)}`);
            this.handleKeyboardTrigger(msg);
        }
    }

    private ensureMidiMapping = (midiName: MidiInstrumentName): MidiTriggerMappings => {
        if (this.midiInputs[midiName]) {
            return this.midiInputs[midiName];
        }

        const instrument = new this.midi.Input(midiName);
        instrument.on('noteon', (msg) => {
            this.handleNoteOn(midiName, msg);
        });
        instrument.on('noteoff', (msg) => {
            this.handleNoteOff(midiName, msg);
        });

        return this.midiInputs[midiName] = {
            controlButtons: [],
            controlKnobs: [],
            keyboard: undefined,
        };
    }
}

export const equalControlButton = (button: ControlButtonMapping, msg: easymidi.Note) => {
    return button.channel === msg.channel && button.note === msg.note;
};

export const equalKeyboard = (keyboard: KeyboardMapping, msg: easymidi.Note) => {
    return keyboard.channel === msg.channel;
};
