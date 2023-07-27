import {MidiTriggerMappings} from '../trigger_types';

import {WledConfig} from './wled_config';

export type ActionConfig = {
    thing: string;
    action: string;
}

export type WledActionConfig = ActionConfig;

export type MidiActionConfig = {
    chord?: {
        notes: number[];
    };
} & ActionConfig;

export type MidiInputConfig = MidiTriggerMappings;
export type MidiOutputConfig = {
    name: string;
    alias?: string;
}

export type Config = {
    wled: WledConfig;
    midi: {
        inputs: MidiInputConfig[];
        outputs: MidiOutputConfig[];
    };

    actions: {
        [actionHash: string]: Array<WledActionConfig | MidiActionConfig>;
    };
}
