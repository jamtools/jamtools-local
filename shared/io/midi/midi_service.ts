import type {Input, Note, Output} from 'easymidi';
import {Subject} from 'rxjs';

import {MidiTriggerMappings} from '../../types/trigger_types';

import {MidiInstrumentName} from '../../constants/midi_instrument_constants';

import {Config} from '../../types/config_types/config_types';
import {EasyMidi} from '../../types/easy_midi_types';

import {ControlChangeEvent, equalControlButton, equalKeyboard, isControlChangeEvent, isNoteOffEvent, isNoteOnEvent, MidiMessage, MidiMessageType, MidiSubjectMessage, NoteOffEvent, NoteOnEvent} from './midi_utls';

export type {MidiSubjectMessage} from './midi_utls';

export default class MidiService {
    private midiEventSubject: Subject<MidiSubjectMessage>;
    private inputs: Input[] = [];
    private outputs: Output[] = [];

    constructor(private midi: EasyMidi, private config: Pick<Config, 'midi'>) {
        this.midiEventSubject = new Subject();
        // this.setupMidi();
    }

    setupMidi = async () => {
        const maybeEnable = this.midi as unknown as {enable?: () => Promise<void>};
        if (maybeEnable.enable) {
            try {
                await maybeEnable.enable();
            } catch (e) {
                alert(e);
                return;
            }
        }

        const allInputs = this.midi.getInputs();
        for (const configInput of this.config.midi.inputs) {
            if (allInputs.find((midiName) => midiName === configInput.name)) {
                this.registerInput(configInput.name as MidiInstrumentName, configInput);
            }
        }

        const allOutputs = this.midi.getOutputs();
        for (const configOutput of this.config.midi.outputs) {
            if (allOutputs.find((midiName) => midiName === configOutput.name)) {
                this.registerOutput(configOutput.name as MidiInstrumentName);
            }
        }
    };

    // sendMessage = (midiName: MidiInstrumentName, type: MidiMessageType, msg: MidiMessage) => {
    sendMessage = (type: MidiMessageType, msg: MidiMessage) => {
        this.outputs.forEach((output) => {
            output.send(type as unknown as 'noteon', msg as Note);
        });
    };

    subscribe = (callback: (subjectMessage: MidiSubjectMessage) => void) => {
        return this.midiEventSubject.subscribe(callback);
    };

    subscribeToControlButtons = (callback: (actionIndex: number) => void) => {
        return this.midiEventSubject.subscribe((event) => {
            if (event.type !== 'noteon') {
                return;
            }

            const inputConfig = this.getInputConfig(event.name);
            if (!inputConfig) {
                return;
            }

            const controlButtonsDict = inputConfig.controlButtons;
            if (!controlButtonsDict) {
                return;
            }

            const controlButtons = Object.values(controlButtonsDict);
            if (!controlButtons?.length) {
                return;
            }

            const control = controlButtons.find((button) => equalControlButton(button, event));
            if (!control) {
                return;
            }

            const index = controlButtons.indexOf(control);
            callback(index);
        });
    };

    subscribeToSustainPedal = (
        onPress: (subjectMessage: MidiSubjectMessage<ControlChangeEvent>) => void,
        onRelease: (subjectMessage: MidiSubjectMessage<ControlChangeEvent>) => void,
    ) => {
        return this.midiEventSubject.subscribe((event) => {
            if (!isControlChangeEvent(event)) {
                return;
            }

            if (!this.isSustainPedalEvent(event)) {
                return;
            }

            if (event.msg.value === 127) {
                onPress(event);
            } else {
                onRelease(event);
            }
        });
    };

    private isSustainPedalEvent = (event: MidiSubjectMessage): event is MidiSubjectMessage<ControlChangeEvent> => {
        if (!isControlChangeEvent(event)) {
            return false;
        }

        const input = this.getInputConfig(event.name);
        return Boolean(input?.sustainPedal);
    };

    subscribeToMainTrigger = (
        callback: (subjectMessage: MidiSubjectMessage<NoteOnEvent>) => void,
    ) => {
        return this.midiEventSubject.subscribe((event) => {
            if (!this.isMainTriggerEvent(event)) {
                return;
            }

            callback(event);
        });
    };

    private isMainTriggerEvent = (event: MidiSubjectMessage): event is MidiSubjectMessage<NoteOnEvent> => {
        if (!isNoteOnEvent(event)) {
            return false;
        }

        const input = this.getInputConfig(event.name);
        if (!input?.mainTrigger) {
            return false;
        }

        if (input.name === MidiInstrumentName.DTX_DRUMS && event.msg.velocity < 66) {
            return false;
        }

        return equalControlButton(input.mainTrigger, event);
    };

    subscribeToMusicalKeyboard = (
        callback: (subjectMessage: MidiSubjectMessage<NoteOnEvent | NoteOffEvent>) => void,
    ) => {
        return this.midiEventSubject.subscribe((event) => {
            if (!this.isMusicalKeyboardEvent(event)) {
                return;
            }

            callback(event);
        });
    };

    private isMusicalKeyboardEvent = (event: MidiSubjectMessage): event is MidiSubjectMessage<NoteOnEvent | NoteOffEvent> => {
        if (!isNoteOnEvent(event) && !isNoteOffEvent(event)) {
            return false;
        }

        const input = this.getInputConfig(event.name);
        if (!input?.keyboard) {
            return false;
        }

        return equalKeyboard(input.keyboard, event);
    };

    private getInputConfig = (instrumentName: string): MidiTriggerMappings | undefined => {
        return this.config.midi.inputs.find((input) => input.name === instrumentName);
    };

    close = () => {
        this.inputs.forEach((input) => input.close());
        this.outputs.forEach((output) => {
            // this.notesOff(output);
            output.close();
        });
    };

    notesOff = (output: Output) => {
        for (let i = 0; i < 100; i++) {
            const note = 24 + i;
            output.send('noteoff', {
                channel: 0,
                note,
                velocity: 0,
            });
        }
    };

    notesOffExceptFor = (keepHolding: Note[]) => {
        for (let i = 0; i < 100; i++) {
            const note = 24 + i;
            if (keepHolding.find((n) => n.note === note)) {
                continue;
            }

            for (const output of this.outputs) {
                output.send('noteoff', {
                    channel: 0,
                    note,
                    velocity: 0,
                });
            }
        }
    };

    notesOffAll = () => {
        this.outputs.forEach(this.notesOff);
    };

    getInputs = () => this.inputs;
    getOutputs = () => this.outputs;

    private registerInput = (midiName: MidiInstrumentName, inputConfig: MidiTriggerMappings) => {
        const input = this.midi.createInput(midiName);

        input.on('noteon', (msg) => {
            // console.log('onnyy')
            if (msg.velocity === 0) {
                this.midiEventSubject.next({
                    name: midiName,
                    type: 'noteoff',
                    msg,
                });
                return;
            }

            if (midiName === MidiInstrumentName.DTX_DRUMS && msg.velocity < 60) {
                return;
            }

            this.midiEventSubject.next({
                name: midiName,
                type: 'noteon',
                msg,
            });
        });

        input.on('noteoff', (msg) => {
            // console.log('offyy')
            this.midiEventSubject.next({
                name: midiName,
                type: 'noteoff',
                msg,
            });
        });

        input.on('cc', (msg) => {
            this.midiEventSubject.next({
                name: midiName,
                type: 'cc',
                msg,
            });
        });

        if (inputConfig.clock) {
            input.on('clock' as unknown as 'noteon', (msg) => { // TODO: incorrect type here
                this.midiEventSubject.next({
                    name: midiName,
                    type: 'clock',
                    msg,
                });
            });
        }

        this.inputs.push(input);
    };

    private registerOutput = (midiName: MidiInstrumentName) => {
        const output = this.midi.createOutput(midiName);
        this.outputs.push(output);
    };
}
