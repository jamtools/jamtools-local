import easymidi from 'easymidi';
import {Subscription} from 'rxjs';
import {CHORDS} from '../constants/chord_constants';
import {jimmySet1, jimmySet2, michaelSet1, set1, set2} from '../constants/progression_constants';
import BluetoothRemoteDynamicMapping from '../dynamic_mappings/qwerty_dynamic_mappings';
import ChordSupervisor from '../music/chord_supervisor';

import MidiService, {MidiSubjectMessage} from '../services/midi_service';
import QwertyService from '../services/qwerty_service';
import WledService from '../services/wled_service';
import {Config} from '../types/config_types/config_types';

import {ModeManager} from '../types/mode_manager_types';
import {ControlButtonMapping, KeyboardMapping} from '../types/trigger_types';
import {log} from '../utils';

import type App from '../app';
import {MidiInstrumentName} from '../constants/midi_instrument_constants';

type MidiEventHandler = ((msg: MidiSubjectMessage) => void) | undefined;

const songs: number[][][][] = [
    // set1,
    // set2,
    jimmySet1,
    jimmySet2,
    michaelSet1,
]
// const progressions = set2;
// const progressions = set1;

const wledPresets = [
    3,
    5,
    6,
    7,
    8,
    9,
    10,
];

const x = BigInt(98469083460984369843984938259824605984260948369034860943856093458);

export default class ProgressionModeManager implements ModeManager {
    private actions: MidiEventHandler[];
    private midiEventHandlers: {[eventName: string]: MidiEventHandler};
    private currentProgression = 0;
    private currentChord = 0;
    private currentSong = 0;

    shouldDrumsChangeColor = true;
    shouldDrumsChangeProgression = false;

    private midiServiceSubject: Subscription;
    // private qwertyServiceSubject: Subscription;

    // private dynamicMapping: BluetoothRemoteDynamicMapping;

    constructor(
        private midiService: MidiService,
        private wledService: WledService,
        // private qwertyService: QwertyService,
        private config: Config,
        private app: App,
    ) {
        this.actions = [
            this.app.toggleDrumsMusicAction,
            this.app.noteOffAll,
            this.app.setRandomColor,
            this.app.nextPreset,
            this.nextSong,
            this.playChordAndChangeColor,
            this.playChordAndChangePreset,
            this.playChordAndChangePreset,
            this.nextProgressionAndPreset,
            this.app.setRandomEffect,
        ];

        this.midiEventHandlers = {
            'noteon': this.handleKeyboardNoteOn,
            'noteoff': this.handleKeyboardNoteOff,
            'cc': this.handleControlKnob,
        };

        this.midiServiceSubject = midiService.subscribe(msg => {
            const handler = this.midiEventHandlers[msg.type];
            if (handler) {
                handler(msg);
            }
        });

        // this.qwertyServiceSubject = this.qwertyService.subscribe(key => {
        //     this.handleQwertyEvent(key);
        // });

        // this.chordSupervisor = new ChordSupervisor(midiService);
        // this.dynamicMapping = new BluetoothRemoteDynamicMapping([
        //     {
        //         name: 'play chord',
        //         func: this.playChord,
        //     },
        //     {
        //         name: 'play chord and change color',
        //         func: this.playChordAndChangeColor,
        //     },
        //     {
        //         name: 'play chord and change preset',
        //         func: this.playChordAndChangePreset,
        //     },
        // ], {
        //     name: 'change progression and change preset',
        //     func: this.nextProgressionAndPreset,
        // }, this.qwertyService);
    }

    close = () => {
        this.midiServiceSubject.unsubscribe();
        // this.qwertyServiceSubject.unsubscribe();
        // this.dynamicMapping.close();
    }

    playChord = () => {
        const progression = songs[this.currentSong][this.currentProgression];
        // const progression = progressions[this.currentProgression];

        const chord = progression[this.currentChord];
        this.currentChord = (this.currentChord + 1) % progression.length;

        this.app.playChord(chord);
    }

    nextSong = () => {
        const progressions = songs[this.currentSong];
        this.currentProgression = (this.currentProgression + 1) % progressions.length;
        this.currentProgression = 0;
        this.currentChord = 0;

        this.currentSong = (this.currentSong + 1) % songs.length;
    }

    nextProgression = () => {
        const progressions = songs[this.currentSong];
        this.currentProgression = (this.currentProgression + 1) % progressions.length;
        this.currentChord = 0;
        this.playChord();
    }

    nextProgressionAndPreset = () => {
        this.nextProgression();
        this.app.nextPreset();
    }

    playChordAndChangeColor = () => {
        this.playChord();
        this.app.setRandomColor();
    }

    playChordAndChangePreset = () => {
        console.log(1000)
        this.playChord();
        this.app.nextPreset();
    }

    handleControlKnob = (msg: MidiSubjectMessage) => {
    }

    lastTimeAction = {};
    handleKeyboardNoteOn = (msg: MidiSubjectMessage) => {
        const inputConfig = this.config.midi.inputs.find(i => i.name === msg.name);
        if (!inputConfig) {
            return;
        }

        // console.log(msg)

        if (msg.name === MidiInstrumentName.IAC_DRIVER_BUS_1 || msg.name === MidiInstrumentName.DTX_DRUMS) {
            if (this.shouldDrumsChangeColor) {
                this.app.setRandomColor();
            }

            if (this.shouldDrumsChangeProgression) {
                this.nextProgression();
                this.shouldDrumsChangeProgression = false;
            } else {
                this.playChord();
            }

            return;
        }

        const controlButtonsDict = inputConfig.controlButtons;
        if (controlButtonsDict) {
            const controlButtons = Object.values(controlButtonsDict);
            if (controlButtons?.length) {
                const control = controlButtons.find(button => equalControlButton(button, msg));
                if (control) {
                    const index = controlButtons.indexOf(control);
                    const action = this.actions[index];
                    if (!action) {
                        console.warn(`Undefined action for control button ${JSON.stringify(control)}`)
                        return;
                    }

                    const now = new Date();
                    if (this.lastTimeAction[index]) {
                        if (now.getTime() - this.lastTimeAction[index] < 200) {
                            return;
                        }
                    }

                    this.lastTimeAction[index] = now;

                    log(`Running action ${index}`);
                    action(msg);
                    return;
                }
            }
        }

        const keyboard = inputConfig.keyboard;
        if (keyboard && equalKeyboard(keyboard, msg)) {
            this.midiService.sendMessage(msg.type, msg.msg);
        }
    }

    handleKeyboardNoteOff = (msg: MidiSubjectMessage) => {
        const inputConfig = this.config.midi.inputs.find(i => i.name === msg.name);
        if (!inputConfig) {
            return;
        }

        const keyboard = inputConfig.keyboard;
        if (keyboard && equalKeyboard(keyboard, msg)) {
            this.midiService.sendMessage(msg.type, msg.msg);
        }
    }

    handleQwertyEvent = (key: string) => {
        // console.log(key);

        // const actions = {
        //     u: this.setRandomColor,
        //     h: this.setRandomEffect,
        //     w: this.increaseWledSpeed,
        //     x: this.decreaseWledSpeed,
        //     p: this.playChord,

        //     c: this.playChord,
        //     m: this.nextProgression,
        // };

        // const action = actions[key];
        // if (action) {
        //     log('running action for ' + key);
        //     action();
        // }
    }
}

export const equalControlButton = (button: ControlButtonMapping | undefined, msg: MidiSubjectMessage) => {
    if (!button) {
        return false;
    }

    const noteMsg = msg.msg as easymidi.Note;
    return button.channel === noteMsg.channel && button.note === noteMsg.note;
};

export const equalKeyboard = (keyboard: KeyboardMapping, msg: MidiSubjectMessage) => {
    const noteMsg = msg.msg as easymidi.Note;
    return keyboard.channel === noteMsg.channel;
};
