export type KeyboardMapping = {
    channel: number;
}

export type ControlButtonMapping = {
    channel: number;
    note: number;
} | null;

export type MidiTriggerMappings = {
    name: string;
    alias?: string;
    keyboard?: KeyboardMapping;
    controlButtons?: {[name: string]: ControlButtonMapping | undefined};
    clock?: boolean;

    // these should be changed to be ControlButtonMapping to be more configurable
    sustainPedal?: boolean;
    mainTrigger?: ControlButtonMapping;
}
