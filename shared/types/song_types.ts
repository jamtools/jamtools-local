export type Song = {
    name: string;
    chords: Chord[];
    sections: Section[];
    arrangement: number[]; // array of indicies in `sections` array
    comments: string[];
    metadata: UserDefinedMetadata;
}

export type Section = {
    id: string;
    name: string;
    steps: Step[];
    comments: string[];
    metadata: UserDefinedMetadata;
}

export type UserDefinedMetadata = unknown;

export type Chord = {
    id: string;
    base_chord_id: string; // id for C Major
    chord_family_ids: string[]; // id for "second inversion in the middle octave" or something like that

    name: string;
    short_name: string;
    long_name: string;
    midi_notes: number[];
    comments: string[];
    metadata: UserDefinedMetadata; // searchable
}

export type Step = {
    actions: Action[];
}

// export type Action = {
//     type: 'wled' | 'midi';
// }


export type SetConfig = {
    wled: WledSetConfig;
    mappings: SetTriggerMappings;
    // sections: SetSection[];
}

// full definition of a "color"
type Color = {
    palette?: string;
    other?: {

    };
}

type WledSetConfig = {
    // don't focus on making this too powerful right now. simple rules, not a lot of detail of configuration
    ip: string;
    presets: string[];
    palettes: string[];

    // eventually do things like this:
    scenes: [
        {
            id: string;
            name: string;
            preset?: number;
            colors?: Color[];
            effect?: {
                id: number;
                intensity: number;
                speed: number;
            },
        }
    ]
}

type TriggerName = string;

type WledActionName = 'next palette' | 'next preset';

// const WLED_ACTION_NAMES: Record<string, WledActionName> = {
//     NEXT_PALETTE: 'next palette',
//     NEXT_PRESET: 'next preset',
// }

type WledAction = {
    type: 'wled',
    name: string;
    action: WledActionName;
}

type MidiActionName = 'next chord' | 'next progression';

// const MIDI_ACTION_NAMES: Record<string, MidiActionName> = {
//     NEXT_CHORD: 'next chord',
//     NEXT_PROGRESSION: 'next progression',
// }

type MidiAction = {
    type: 'midi',
    name: string;
    action: MidiActionName;
}

type Action = WledAction | MidiAction;

type SetTriggerMappings = {
    [trigger: TriggerName]: Action[];
}

const x: SetConfig = {
    "chords": {
        "C": [
            12,
            24,
            36
        ]
    },
    "wled": {
        "presets": [

        ],
        "palettes": [

        ]
    },
    "mappings": {
        "A1": [
            {
                "type": "midi",
                "name": "Juno USB Midi",
                "action": "next chord"
            }
        ],
        "A2": [
            {
                "type": "midi",
                "name": "Juno USB Midi",
                "action": "next chord"
            },
            {
                "type": "wled",
                "name": "Diamond",
                "action": "next palette"
            }
        ],
        "A3": [
            {
                "type": "midi",
                "name": "Juno USB Midi",
                "action": "next chord"
            },
            {
                "type": "wled",
                "name": "Diamond",
                "action": "next preset"
            }
        ],
        "A4": [
            {
                "type": "midi",
                "name": "Juno USB Midi",
                "action": "next progression"
            },
            {
                "type": "wled",
                "name": "Diamond",
                "action": "next preset"
            }
        ]
    },
    "sections": [
        {
            "steps": [
                {
                    "chord": "C"
                }
            ]
        }
    ]
}
