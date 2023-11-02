import type App from '../app';

export enum ControlPanelActions {
    CHANGE_COLOR = 'Change Color',
    CHANGE_PRESET = 'Change Preset',
    TOGGLE_DRUM_COLOR_ACTION = 'Toggle Drum Color Action',
    TOGGLE_DRUM_MUSIC_ACTION = 'Toggle Drum Chord/Progression Action',
    RESET_PROGRESSION = 'Reset Progression',
    LOCK_IN_PROGRESSION = 'Lock-in Progression',
    SOUND_OFF = 'Sound Off',
    // LIGHTS_OFF = 'Lights Off',
}

export type SerializedAction = {
    action: ControlPanelActions;
}

export type ActionMap = Record<ControlPanelActions, () => void>;

export const getActionMap = ({actions}: App): ActionMap => ({
    [ControlPanelActions.CHANGE_COLOR]: actions.setRandomColor,
    [ControlPanelActions.CHANGE_PRESET]: actions.nextPreset,
    [ControlPanelActions.TOGGLE_DRUM_COLOR_ACTION]: actions.toggleDrumsColorAction,
    [ControlPanelActions.TOGGLE_DRUM_MUSIC_ACTION]: actions.toggleDrumsMusicAction,

    [ControlPanelActions.SOUND_OFF]: actions.noteOffAll,
    [ControlPanelActions.LOCK_IN_PROGRESSION]: actions.lockInProgression,
    [ControlPanelActions.RESET_PROGRESSION]: actions.resetProgression,
});
