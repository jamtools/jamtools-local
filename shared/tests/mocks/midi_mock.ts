import {EasyMidi, OutputConstructor} from 'types/easy_midi_types';

export class MidiMock implements EasyMidi {
    getInputs = () => [];
    getOutputs = () => [];
    Input = MockInputConstructor;
    Output: OutputConstructor;
}

class MockInputConstructor {
    constructor() {

    }
}
