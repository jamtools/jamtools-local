import easymidi from 'easymidi';

import {MidiInstrumentName} from '../constants/midi_instrument_constants';

export type KeyboardMapping = {
    channel: easymidi.Channel;
}

export type ControlButtonMapping = {
    channel: easymidi.Channel;
    note: number;
}

export type ControlKnobMapping = {

}

export type MidiTriggerMappings = {
    keyboard?: KeyboardMapping;
    controlButtons: ControlButtonMapping[];
    controlKnobs: ControlKnobMapping[];
}

export type MidiInputMapper = {
    [name in MidiInstrumentName]: MidiTriggerMappings
}

export type MidiOutputMapper = {
    [name in MidiInstrumentName]: {};
}
