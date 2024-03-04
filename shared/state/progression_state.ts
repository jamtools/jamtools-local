import type {Chords} from '../types/adhoc_chord_mode_types';

export type ProgressionState = {
    currentProgression: number;
    currentChord: number;
    currentSong: number;
    shouldDrumsChangeColor: boolean;
    shouldDrumsChangeProgression: boolean;
}

export type AdhocProgressionState = {
    chords: Chords;
    currentIndex: number;
    mode: 'composition' | 'playback';
}
