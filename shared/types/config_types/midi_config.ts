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

export type MidiInputConfig = {
    name: string;
    keyboard?: KeyboardMapping;
    controlButtons?: ControlButtonMapping[];
    controlKnobs?: ControlKnobMapping[];
    clock?: boolean;
};

export type MidiConfig = {
    inputs: MidiInputConfig[];
    outputs: {
        name: string;
    }[];
}
