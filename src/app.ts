import process from 'node:process';

import ProgressionModeManager from './application_mode_managers.ts/progression_mode_manager';
import {CHORDS} from './constants/chord_constants';
import ChordSupervisor from './music/chord_supervisor';

import MidiService, {MidiSubjectMessage} from './services/midi_service';
import QwertyService, {Stdin} from './services/qwerty_service';
import WledService from './services/wled_service';
import {Config} from './types/config_types/config_types';
import {EasyMidi} from './types/easy_midi_types';

export default class App {
    progressionMode: ProgressionModeManager;
    private midiService: MidiService;
    private wledService: WledService;
    private qwertyService: QwertyService;
    private chordSupervisor: ChordSupervisor;

    constructor(private midi: EasyMidi, private stdin: Stdin, private config: Config) {
        this.midiService = new MidiService(midi, config);
        this.wledService = new WledService(config);
        this.qwertyService = new QwertyService(stdin, config);
        this.chordSupervisor = new ChordSupervisor(this.midiService);

        this.progressionMode = new ProgressionModeManager(this.midiService, this.wledService, config, this);
        // this.progressionMode = new ProgressionModeManager(this.midiService, this.wledService, this.qwertyService, config, this);

        this.setExitHandler();
    }

    toggleDrumsColorAction = () => {
        this.progressionMode.shouldDrumsChangeColor = !this.progressionMode.shouldDrumsChangeColor;
    }

    toggleDrumsMusicAction = () => {
        this.progressionMode.shouldDrumsChangeProgression = !this.progressionMode.shouldDrumsChangeProgression;
    }

    playChord = (chord: number[]) => {
        console.log(chord);

        this.chordSupervisor.playChord(chord);
        const name = Object.keys(CHORDS).find(key => CHORDS[key] === chord);
        setTimeout(() => console.log('playing chord ' + name), );
    }

    nextPreset = () => {
        // const presetIndex = (this.currentPreset + 1) % wledPresets.length;
        // this.currentPreset = presetIndex;
        // const preset = wledPresets[presetIndex];
        // this.wledService.setPreset(preset);
        // console.log('next preset')
        this.wledService.setRandomPreset()
    }

    savePreset = () => {
        // button to save current state as preset
        this.wledService.savePreset();
    };

    noteOffAll = () => {
        this.midiService.notesOffAll();
        this.chordSupervisor.notesOffAll();
    }

    setRandomColor = () => {
        this.wledService.setRandomColor();
    }

    setRandomEffect = (msg: MidiSubjectMessage) => {
        this.wledService.setRandomEffect();
    }

    increaseWledSpeed = () => {
        this.wledService.increaseSpeed();
    }

    decreaseWledSpeed = () => {
        this.wledService.decreaseSpeed();
    }

    private setExitHandler = () => {
        // so the program will not close instantly
        this.stdin.resume();

        const exitHandler = (options, exitCode) => {
            if (options.cleanup) {
                this.progressionMode.close();
                this.midiService.close();
                this.qwertyService.close();
            }
            if (options.exit) {
                process.exit();
            }
        }

        // always runs after other handlers
        process.on('exit', exitHandler.bind(null, {cleanup: true}));

        // catches ctrl+c event
        process.on('SIGINT', exitHandler.bind(null, {exit: true}));

        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
        process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));

        // process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
    }
}
