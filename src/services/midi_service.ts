import {Input, Output} from 'easymidi';
import {ReplaySubject, Subject} from 'rxjs';

import {MidiInstrumentName} from '../constants/midi_instrument_constants';
import {MidiMessage, MidiMessageType} from '../midi';
import {Config} from '../types/config_types';
import {EasyMidi} from '../types/easy_midi_types';

export type MidiSubjectMessage = {
    name: MidiInstrumentName;
    type: MidiMessageType;
    msg: MidiMessage;
}

export default class MidiService {
    private subject: Subject<MidiSubjectMessage> = new ReplaySubject();
    private inputs: Input[] = [];
    private outputs: Output[] = [];

    constructor(private midi: EasyMidi, private config: Config) {
        const allInputs = midi.getInputs();
        for (const configInput of config.midi.inputs) {
            if (allInputs.find(midiName => midiName === configInput.name)) {
                this.registerInput(configInput.name as MidiInstrumentName);
            }
        }

        const allOutputs = midi.getOutputs();
        for (const configOutput of config.midi.outputs) {
            if (allOutputs.find(midiName => midiName === configOutput.name)) {
                this.registerOutput(configOutput.name as MidiInstrumentName);
            }
        }
    }

    // sendMessage = (midiName: MidiInstrumentName, type: MidiMessageType, msg: MidiMessage) => {
    sendMessage = (type: MidiMessageType, msg: MidiMessage) => {
        this.outputs.forEach(output => {
            output.send(type as any, msg as any);
        });
    }

    subscribe = (callback: (subjectMessage: MidiSubjectMessage) => void) => {
        return this.subject.subscribe(callback);
    }

    close = () => {
        this.inputs.forEach(input => input.close());
        this.outputs.forEach(output => {
            this.notesOff(output);
            output.close();
        });
    }

    notesOff = (output: Output) => {
        for (let i=0; i< 100; i++) {
            const note = 24 + i;
            output.send('noteoff', {
                channel: 0,
                note,
                velocity: 0,
            });
        }
    }

    notesOffAll = () => {
        this.outputs.forEach(this.notesOff);
    }

    getInputs = () => this.inputs;
    getOutputs = () => this.outputs;

    private registerInput = (midiName: MidiInstrumentName) => {
        const input = new this.midi.Input(midiName);

        input.on('noteon', (msg) => {
            this.subject.next({
                name: midiName,
                type: 'noteon',
                msg,
            });
        });

        input.on('noteoff', (msg) => {
            this.subject.next({
                name: midiName,
                type: 'noteoff',
                msg,
            });
        });

        input.on('cc', (msg) => {
            this.subject.next({
                name: midiName,
                type: 'cc',
                msg,
            });
        });

        this.inputs.push(input);
    }

    private registerOutput = (midiName: MidiInstrumentName) => {
        const output = new this.midi.Output(midiName);
        this.outputs.push(output);
    }
}
