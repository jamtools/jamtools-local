import easymidi from 'easymidi';

import {MidiInstrumentName} from '../constants/midi_instrument_constants';

export type KeyboardMapping = {
    channel: number;
}

export type ControlButtonMapping = {
    channel: number;
    note: number;
} | null;

export type ControlKnobMapping = {

}

export type MidiTriggerMappings = {
    name: string;
    keyboard?: KeyboardMapping;
    controlButtons?: ControlButtonMapping[];
    controlKnobs?: ControlKnobMapping[];
}
