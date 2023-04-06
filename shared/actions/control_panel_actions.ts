import type App from '@shared/app';

export enum ControlPanelActions {
    NEXT_CHORD = 'Next Chord',
    NEXT_PROGRESSION = 'Next Progression',
    NEXT_SONG = 'Next Song',
    SOUND_OFF = 'Sound Off',
    CHANGE_COLOR = 'Change Color',
    CHANGE_PRESET = 'Change Preset',
    TOGGLE_DRUM_COLOR_ACTION = 'Toggle Drum Color Action',
    TOGGLE_DRUM_MUSIC_ACTION = 'Toggle Drum Chord/Progression Action',
    TEST_MIDI_NOTE = 'Test Midi Note',
    // LIGHTS_OFF = 'Lights Off',
    // SAVE_PRESET = 'Save Preset',
}

export type SerializedAction = {
    action: ControlPanelActions;
}

export type ActionMap = Record<ControlPanelActions, () => void>;

export const getActionMap = ({actions}: App): ActionMap => ({
    [ControlPanelActions.CHANGE_COLOR]: actions.setRandomColor,
    [ControlPanelActions.CHANGE_PRESET]: actions.nextPreset,
    [ControlPanelActions.NEXT_CHORD]: actions.playNextChord,
    [ControlPanelActions.NEXT_PROGRESSION]: actions.nextProgression,

    [ControlPanelActions.TOGGLE_DRUM_COLOR_ACTION]: actions.toggleDrumsColorAction,
    [ControlPanelActions.TOGGLE_DRUM_MUSIC_ACTION]: actions.toggleDrumsMusicAction,
    [ControlPanelActions.SOUND_OFF]: actions.noteOffAll,
    [ControlPanelActions.NEXT_SONG]: actions.nextSong,
    [ControlPanelActions.TEST_MIDI_NOTE]: actions.testMidiNote,
    // [ControlPanelActions.LIGHTS_OFF]: app.setRandomColor,
    // [ControlPanelActions.RAINBOW]: app.setRandomColor,
    // [ControlPanelActions.SAVE_PRESET]: app.savePreset,
});
