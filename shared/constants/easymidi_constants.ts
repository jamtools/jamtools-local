export const INPUT_TYPES = [
    'noteoff',
    'noteon',
    'poly aftertouch',
    'cc',
    'program',
    'channel aftertouch',
    'pitch',
];

export const INPUT_EXTENDED_TYPES = [
    'sysex',
    'mtc',
    'position',
    'select',
    'tune',
    'sysex end',
    'clock',
    'start',
    'continue',
    'stop',
    'activesense',
    'reset'
];

export const SPAMMY_MIDI_EVENT_TYPES = {
    CLOCK: 'clock',
    PITCH: 'pitch',
    ACTIVE_SENSE: 'activesense',
}
