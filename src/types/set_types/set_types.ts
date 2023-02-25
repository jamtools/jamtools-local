export type SetConfig = {
    chords: Record<string, number[]>;
    wled: WledSetConfig;
    mappings: SetTriggerMappings;
    sections: SetSection[];
}

type SectionStep = {
    chord: string;
}

type SetSection = {
    steps: SectionStep[];
}

type WledSetConfig = {
    presets: string[];
    palettes: string[];
}

type TriggerName = string;

type WledActionName = 'next palette' | 'next preset';

const WLED_ACTION_NAMES: Record<string, WledActionName> = {
    NEXT_PALETTE: 'next palette',
    NEXT_PRESET: 'next preset',
}

type WledAction = {
    type: 'wled',
    name: string;
    action: WledActionName;
}

type MidiActionName = 'next chord' | 'next progression';

const MIDI_ACTION_NAMES: Record<string, MidiActionName> = {
    NEXT_CHORD: 'next chord',
    NEXT_PROGRESSION: 'next progression',
}

type MidiAction = {
    type: 'midi',
    name: string;
    action: MidiActionName;
}

type ActionMapping = WledAction | MidiAction;

type SetTriggerMappings = {
    [trigger: TriggerName]: ActionMapping[];
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
