
import {Chords} from '../../types/adhoc_chord_mode_types';

import {AdhocProgressionState} from '../../state/progression_state';

import {michaelSet1} from '../../constants/progression_constants';

const chords: Chords = michaelSet1[0].map((chord) => chord.map((note) => ({
    note,
    velocity: 100,
    channel: 1,
})));

export const initialState: AdhocProgressionState = {
    chords,
    currentIndex: -1,
    mode: 'playback',
};
