import {EasyMidi, InputConstructor, OutputConstructor} from 'types/easy_midi_types';

export class MidiMock implements EasyMidi {
    getInputs: () => string[];
    getOutputs: () => string[];
    Input: InputConstructor;
    Output: OutputConstructor;
}
