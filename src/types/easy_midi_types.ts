import easymidi from 'easymidi';

export interface InputConstructor {
    new(name: string, virtual?: boolean | undefined): easymidi.Input;
}

export interface OutputConstructor {
    new(name: string, virtual?: boolean | undefined): easymidi.Output;
}

export type EasyMidi = {
    getInputs: () => string[];
    getOutputs: () => string[];
    Input: InputConstructor;
    Output: OutputConstructor;
};
