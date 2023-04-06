import {ReplaySubject, Subject} from 'rxjs';

import ProgressionModeManager from './application_mode_managers.ts/progression_mode_manager';
import {CHORDS} from './constants/chord_constants';
import {OutputChordSupervisor} from './music/output_chord_supervisor';

import MidiService from './services/midi_service';
import QwertyService, {Stdin} from './services/qwerty_service';
import WledService from './services/wled_service';
import {Config} from './types/config_types/config_types';
import {EasyMidi} from './types/easy_midi_types';

import {GlobalState} from './state/global_state';
import {UserDataState} from './state/user_data_state';

export default class App {
    progressionMode: ProgressionModeManager;
    private midiService: MidiService;
    private wledService: WledService;
    private qwertyService: QwertyService;
    private chordSupervisor: OutputChordSupervisor;

    private globalStateSubject: Subject<GlobalState> = new ReplaySubject();

    constructor(
        private midi: EasyMidi,
        private stdin: Stdin,
        private config: Config,
        private userData: UserDataState,
    ) {
        this.midiService = new MidiService(midi, config);
        this.wledService = new WledService(config);
        this.qwertyService = new QwertyService(stdin, config);
        this.chordSupervisor = new OutputChordSupervisor(this.midiService);

        this.progressionMode = new ProgressionModeManager(this.midiService, this.wledService, config, this);
        // this.progressionMode = new ProgressionModeManager(this.midiService, this.wledService, this.qwertyService, config, this);
    }

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
    getProgressionState = () => this.progressionMode.getState();

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
        toggleDrumsColorAction: () => this.progressionMode.toggleDrumColorAction(),
        toggleDrumsMusicAction: () => this.progressionMode.toggleDrumMusicAction(),
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

        playNextChord: () => this.progressionMode.playChord(),
        nextProgression: () => this.progressionMode.nextProgression(),
        nextSong: () => this.progressionMode.nextSong(),

        nextPreset: () => {
            this.wledService.setRandomPreset();
        },

        testMidiNote: () => {

        }
    }

    playSpecificChord = (chord: number[]) => {
        console.log(chord);

        this.chordSupervisor.playChord(chord);
        const name = Object.keys(CHORDS).find(key => CHORDS[key] === chord);
        setTimeout(() => console.log('playing chord ' + name),);
    }

    close = () => {
        this.progressionMode.close();
        this.midiService.close();
        this.qwertyService.close();
    }
}
