import type easymidi from 'easymidi';

export interface InputFactory {
    (name: string, virtual?: boolean | undefined): easymidi.Input;
}

export interface OutputFactory {
    (name: string, virtual?: boolean | undefined): easymidi.Output;
}

export interface InputConstructor {
    new(name: string, virtual?: boolean | undefined): easymidi.Input;
}

export interface OutputConstructor {
    new(name: string, virtual?: boolean | undefined): easymidi.Output;
}

export type EasyMidi = {
    getInputs: () => string[];
    getOutputs: () => string[];
    createInput: InputFactory;
    createOutput: OutputFactory;

    // Input: InputConstructor;
    // Output: OutputConstructor;
};
