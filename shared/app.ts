import {BehaviorSubject, Subject, Subscription} from 'rxjs';

import ProgressionModeManager from './application_mode_managers/progression_mode/progression_mode_manager';
import {CHORDS} from './constants/chord_constants';
import {OutputChordSupervisor} from './io/midi/output_chord_supervisor';

import MidiService from './io/midi/midi_service';
import QwertyService, {Stdin} from './io/qwerty/qwerty_service';
import WledService from './io/wled/wled_service';
import {Config} from './types/config_types/config_types';
import {EasyMidi} from './types/easy_midi_types';

import {GlobalState} from './state/global_state';
import {UserDataState} from './state/user_data_state';
import {AdhocProgressionState, ProgressionState} from './state/progression_state';

import {ApplicationModeManager} from './application_mode_managers/application_mode_manager';
import AdhocChordCompositionMode from './application_mode_managers/adhoc_chord_mode/achoc_chord_composition_mode';
import AdhocChordPlaybackMode from './application_mode_managers/adhoc_chord_mode/achoc_chord_playback_mode';
import {initialState} from './application_mode_managers/adhoc_chord_mode/playback_state';
import {ApplicationModeName} from 'constants/application_mode_constants';

export default class App {
    private globalStateSubject: Subject<GlobalState>;
    private controlButtonSubscription: Subscription;

    adhocCompositionMode?: AdhocChordCompositionMode;
    // adhocCompositionMode?: AdhocChordCompositionMode = new AdhocChordCompositionMode(this.midiService, this);
    adhocPlaybackMode?: AdhocChordPlaybackMode;

    private activeMode: ApplicationModeManager<ProgressionState>;
    // private activeMode: ApplicationModeManager<AdhocProgressionState>;

    constructor(
        private midi: EasyMidi,
        private stdin: Stdin,
        private config: Config,
        private userData: UserDataState,
    ) {
        this.globalStateSubject = new BehaviorSubject(this.getState());
        this.controlButtonSubscription = this.midiService.subscribeToControlButtons(this.handleControlButton);

        // this.adhocPlaybackMode = new AdhocChordPlaybackMode(initialState, this.midiService, this);
        // this.activeMode = this.adhocPlaybackMode!;

        this.progressionMode = new ProgressionModeManager(this.midiService, this.wledService, this.config, this);
        this.activeMode = this.progressionMode;
    }

    handleControlButton = (index: number) => {
        const actions = [
            this.wledService.setRandomColor,
            this.wledService.setRandomPreset,
        ];

        const action = actions[index];
        action?.();
    };

    qwertyService = new QwertyService(this.stdin, this.config);

    midiService = new MidiService(this.midi, this.config);
    wledService = new WledService(this.config);

    progressionMode?: ProgressionModeManager;
    // progressionMode = new ProgressionModeManager(this.midiService, this.wledService, this.config, this);

    chordSupervisor = new OutputChordSupervisor(this.midiService);

    deps = {
        midi: this.midi,
        stdin: this.stdin,
        config: this.config,
        userData: this.userData,
    };

    services = {
        midi: this.midiService,
        userData: this.userData,
    };

    getUserData = () => this.userData;

    getConfig = () => this.config;
    setConfig = async (config: Config) => {
        this.config = config;
        this.broadcastState();
    };

    getProgressionState: () => ProgressionState | undefined = () => this.progressionMode?.getState();
    getAdhocState: () => AdhocProgressionState | undefined = () => {
        if (this.adhocCompositionMode) {
            this.adhocCompositionMode.getState();
        }

        if (this.adhocPlaybackMode) {
            return this.adhocPlaybackMode.getState();
        }

        return undefined;
    };

    getState = (): GlobalState => {
        const currentMode = this.activeMode && (this.activeMode as {constructor: {name: string}}).constructor.name as ApplicationModeName;

        return {
            currentMode,
            config: this.config,
            userData: this.userData,
            // progression: this.getProgressionState(),
            adhocState: this.getAdhocState(),
        };
    };

    broadcastState = (_flash?: boolean) => {
        const state = this.getState();
        this.globalStateSubject.next(state);
    };

    subscribeToGlobalState = (callback: (subjectMessage: GlobalState) => void) => {
        return this.globalStateSubject.subscribe(callback);
    };

    changeModeAdhocPlayback = (state: AdhocProgressionState) => {
        if (this.adhocPlaybackMode) {
            return;
        }

        this.adhocCompositionMode?.close();
        this.adhocCompositionMode = undefined;

        const newState: AdhocProgressionState = {...state, mode: 'playback'};
        this.adhocPlaybackMode = new AdhocChordPlaybackMode(newState, this.midiService, this);
        this.activeMode = this.adhocPlaybackMode;

        this.broadcastState();
    };

    changeModeAdhocComposition = () => {
        this.adhocPlaybackMode?.close();
        this.adhocPlaybackMode = undefined;
        this.adhocCompositionMode?.close();
        this.adhocCompositionMode = undefined;

        this.midiService.notesOffAll();

        this.adhocCompositionMode = new AdhocChordCompositionMode(this.midiService, this);
        this.activeMode = this.adhocCompositionMode;

        this.broadcastState();
    };

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

        lockInProgression: () => {
            if (!this.adhocCompositionMode) {
                return;
            }

            const state = this.adhocCompositionMode.getState();
            this.changeModeAdhocPlayback(state);
        },
        resetProgression: () => {
            this.changeModeAdhocComposition();
        },
    };

    playSpecificChord = (chord: number[]) => {
        console.log(chord);

        this.chordSupervisor.playChord(chord);
        const name = Object.keys(CHORDS).find((key) => CHORDS[key] === chord);
        setTimeout(() => console.log('playing chord ' + name),);
    };

    close = () => {
        this.progressionMode?.close();
        this.adhocCompositionMode?.close();
        this.midiService.close();
        this.qwertyService.close();
    };
}
