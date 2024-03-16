export type KeyboardMapping = {
    channel: number;
}

export type ControlButtonMapping = {
    channel: number;
    note: number;
} | null;

export type MidiTriggerMappings = {
    name: string;
    keyboard?: KeyboardMapping;
    controlButtons?: ControlButtonMapping[];
}

export type MidiInputConfig = {
    name: string;
    keyboard?: KeyboardMapping;
    controlButtons?: ControlButtonMapping[];
    clock?: boolean;
};

export type MidiConfig = {
    inputs: MidiInputConfig[];
    outputs: Array<{
        name: string;
    }>;
}
