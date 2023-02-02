import {MidiTriggerMappings} from '../trigger_types';
import {WledConfig} from './wled_config';

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
    wled: WledConfig;
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
