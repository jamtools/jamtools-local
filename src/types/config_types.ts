import {MidiTriggerMappings} from './trigger_types';

export type ActionConfig = {
    thing: string;
    action: string;
}

export type WledActionConfig = {

} & ActionConfig;

export type MidiActionConfig = {
    chord?: {
        notes: number[];
    };
} & ActionConfig;

export type MidiInputConfig = MidiTriggerMappings;

export type Config = {
    wled: {
        ctrl: {
            name: string;
            ip: string;
        }[];
    };
    midi: {
        inputs: MidiInputConfig[];
        outputs: {
            name: string;
        }[];
    };

    actions: {
        [actionHash: string]: (WledActionConfig | MidiActionConfig)[];
    };
}
