import {ReplaySubject, Subject} from 'rxjs';
import type {Note} from 'easymidi';

import ProgressionModeManager from './application_mode_managers/progression_mode_manager';
import {CHORDS} from './constants/chord_constants';
import {OutputChordSupervisor} from './music/output_chord_supervisor';

import MidiService from './services/midi_service';
import QwertyService, {Stdin} from './services/qwerty_service';
import WledService from './services/wled_service';
import {Config} from './types/config_types/config_types';
import {EasyMidi} from './types/easy_midi_types';

import {GlobalState} from './state/global_state';
import {UserDataState} from './state/user_data_state';
import {ProgressionState} from 'state/progression_state';

import {ApplicationModeManager} from './application_mode_managers/application_mode_manager';
import AdhocChordCompositionMode from './application_mode_managers/adhoc_chord_mode/achoc_chord_composition_mode';
import AdhocChordPlaybackMode from './application_mode_managers/adhoc_chord_mode/achoc_chord_playback_mode';

export default class App {
    private globalStateSubject: Subject<GlobalState> = new ReplaySubject();

    constructor(
        private midi: EasyMidi,
        private stdin: Stdin,
        private config: Config,
        private userData: UserDataState,
    ) {
    }

    qwertyService = new QwertyService(this.stdin, this.config);

    midiService = new MidiService(this.midi, this.config);
    wledService = new WledService(this.config);


    progressionMode?: ProgressionModeManager;
    // progressionMode = new ProgressionModeManager(this.midiService, this.wledService, this.config, this);

    // adhocCompositionMode?: AdhocChordCompositionMode;
    adhocCompositionMode?: AdhocChordCompositionMode = new AdhocChordCompositionMode(this.midiService, this.config, this);

    private activeMode: ApplicationModeManager = this.adhocCompositionMode!;

    chordSupervisor = new OutputChordSupervisor(this.midiService);

    deps = {
        midi: this.midi,
        stdin: this.stdin,
        config: this.config,
        userData: this.userData,
    }

    services = {
        midi: this.midiService,
        userData: this.userData,
    }

    getUserData = () => this.userData;
    getConfig = () => this.config;
    getProgressionState: () => ProgressionState | undefined = () => this.progressionMode?.getState();

    getState = (): GlobalState => {
        return {
            config: this.config,
            userData: this.userData,
            progression: this.getProgressionState(),
        }
    }

    broadcastState = (state = this.getState()) => {
        this.globalStateSubject.next(state);
    }

    subscribeToGlobalState = (callback: (subjectMessage: GlobalState) => void) => {
        return this.globalStateSubject.subscribe(callback);
    }

    actions = {
        toggleDrumsColorAction: () => this.progressionMode?.toggleDrumColorAction(),
        toggleDrumsMusicAction: () => this.progressionMode?.toggleDrumMusicAction(),
        setRandomColor: () => this.wledService.setRandomColor(),
        setRandomEffect: () => this.wledService.setRandomEffect(),
        noteOffAll: () => {
            this.midiService.notesOffAll();
            this.chordSupervisor.notesOffAll();
        },

        savePreset: () => {
            this.wledService.savePreset();
        },

        increaseWledSpeed: () => {
            this.wledService.increaseSpeed();
        },

        decreaseWledSpeed: () => {
            this.wledService.decreaseSpeed();
        },

        playNextChord: () => this.progressionMode?.playChord(),
        nextProgression: () => this.progressionMode?.nextProgression(),
        nextSong: () => this.progressionMode?.nextSong(),

        nextPreset: () => {
            this.wledService.setRandomPreset();
        },

        testMidiNote: () => {

        }
    }

    changeModeAdhocPlayback = (chords: Note[][]) => {
        this.adhocCompositionMode = undefined;

        const playbackMode = new AdhocChordPlaybackMode(chords, this.midiService, this.config, this);
        this.activeMode = playbackMode;
    }

    playSpecificChord = (chord: number[]) => {
        console.log(chord);

        this.chordSupervisor.playChord(chord);
        const name = Object.keys(CHORDS).find(key => CHORDS[key] === chord);
        setTimeout(() => console.log('playing chord ' + name),);
    }

    close = () => {
        this.progressionMode?.close();
        this.adhocCompositionMode?.close();
        this.midiService.close();
        this.qwertyService.close();
    }
}
