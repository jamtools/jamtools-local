export enum ControlPanelActions {
    NEXT_CHORD = 'Next Chord',
    NEXT_PROGRESSION = 'Next Progression',
    NEXT_SONG = 'Next Song',
    SOUND_OFF = 'Sound Off',
    CHANGE_COLOR = 'Change Color',
    CHANGE_PRESET = 'Change Preset',
    TOGGLE_DRUM_COLOR_ACTION = 'Toggle Drum Color Action',
    TOGGLE_DRUM_MUSIC_ACTION = 'Toggle Drum Chord/Progression Action',
    // LIGHTS_OFF = 'Lights Off',
    // SAVE_PRESET = 'Save Preset',
}

export type SerializedAction = {
    action: ControlPanelActions;
}
