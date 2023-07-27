import {Subscription} from 'rxjs';

import {jimmySet1, jimmySet2, michaelSet1} from '../constants/progression_constants';

import MidiService, {MidiSubjectMessage} from '../services/midi_service';
import WledService from '../services/wled_service';
import {Config} from '../types/config_types/config_types';

import {log} from '../utils';

import type App from '../app';
import {MidiInstrumentName} from '../constants/midi_instrument_constants';
import {ProgressionState} from '../state/progression_state';
import {equalControlButton, equalKeyboard} from '../midi';

import {ApplicationModeManager} from './application_mode_manager';

type MidiEventHandler = ((msg: MidiSubjectMessage) => void) | undefined;

const songs: number[][][][] = [
    // set1,
    // set2,
    jimmySet1,
    jimmySet2,
    michaelSet1,
];

export default class ProgressionModeManager implements ApplicationModeManager<ProgressionState> {
    private actions: MidiEventHandler[];
    private midiEventHandlers: {[eventName: string]: MidiEventHandler};
    private progressionState: ProgressionState = {
        currentChord: 0,
        currentProgression: 0,
        currentSong: 0,
        shouldDrumsChangeColor: true,
        shouldDrumsChangeProgression: false,
    };

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
            this.app.actions.toggleDrumsMusicAction,
            this.app.actions.noteOffAll,
            this.app.actions.setRandomColor,
            this.app.actions.nextPreset,
            this.nextSong,
            this.playChordAndChangeColor,
            this.playChordAndChangePreset,
            this.playChordAndChangePreset,
            this.nextProgressionAndPreset,
            this.app.actions.setRandomEffect,
        ];

        this.midiEventHandlers = {
            noteon: this.handleKeyboardNoteOn,
            noteoff: this.handleKeyboardNoteOff,
            cc: this.handleControlKnob,
        };

        this.midiServiceSubject = midiService.subscribe((msg) => {
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

    getState = (): ProgressionState => this.progressionState;

    private setState = (partialState: Partial<ProgressionState>) => {
        this.progressionState = {
            ...this.progressionState,
            ...partialState,
        };
    };

    toggleDrumColorAction = () => {
        this.setState({
            shouldDrumsChangeColor: !this.progressionState.shouldDrumsChangeColor,
        });
    };

    toggleDrumMusicAction = () => {
        this.setState({
            shouldDrumsChangeProgression: !this.progressionState.shouldDrumsChangeProgression,
        });
    };

    close = () => {
        this.midiServiceSubject.unsubscribe();
        // this.qwertyServiceSubject.unsubscribe();
        // this.dynamicMapping.close();
    };

    playChord = () => {
        const {currentSong, currentProgression, currentChord} = this.progressionState;
        const {songs} = this.app.getUserData();

        const progression = songs[currentSong][currentProgression];
        // const progression = progressions[this.currentProgression];

        const chord = progression[currentChord];
        const nextChord = (currentChord + 1) % progression.length;
        this.setState({
            currentChord: nextChord,
        });

        this.app.playSpecificChord(chord);

        // this.dispatchProgressionEvent({
        //     type: 'Played Chord',
        //     chord,
        //     state: this.progressionState,
        // });
    };

    nextSong = () => {
        const {currentSong} = this.progressionState;

        this.setState({
            currentProgression: 0,
            currentChord: 0,
            currentSong: (currentSong + 1) % songs.length,
        });
    };

    nextProgression = () => {
        const {currentSong, currentProgression} = this.progressionState;

        const progressions = songs[currentSong];
        this.setState({
            currentProgression: (currentProgression + 1) % progressions.length,
            currentChord: 0,
        });

        this.playChord();
    };

    nextProgressionAndPreset = () => {
        this.nextProgression();
        this.app.actions.nextPreset();
    };

    playChordAndChangeColor = () => {
        this.playChord();
        this.app.actions.setRandomColor();
    };

    playChordAndChangePreset = () => {
        console.log(1000);
        this.playChord();
        this.app.actions.nextPreset();
    };

    handleControlKnob = (_msg: MidiSubjectMessage) => {
    };

    lastTimeAction = {};
    handleKeyboardNoteOn = (msg: MidiSubjectMessage) => {
        // console.log('on');

        const {shouldDrumsChangeColor, shouldDrumsChangeProgression} = this.progressionState;

        const inputConfig = this.config.midi.inputs.find((i) => i.name === msg.name);
        if (!inputConfig) {
            return;
        }

        // console.log(msg)

        if (msg.name === MidiInstrumentName.IAC_DRIVER_BUS_1 || msg.name === MidiInstrumentName.DTX_DRUMS) {
            if (shouldDrumsChangeColor) {
                this.app.actions.setRandomColor();
            }

            if (shouldDrumsChangeProgression) {
                this.nextProgression();
                this.setState({shouldDrumsChangeProgression: false});
            } else {
                this.playChord();
            }

            return;
        }

        const controlButtonsDict = inputConfig.controlButtons;
        if (controlButtonsDict) {
            const controlButtons = Object.values(controlButtonsDict);
            if (controlButtons?.length) {
                const control = controlButtons.find((button) => equalControlButton(button, msg));
                if (control) {
                    const index = controlButtons.indexOf(control);
                    const action = this.actions[index];
                    if (!action) {
                        console.warn(`Undefined action for control button ${JSON.stringify(control)}`);
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
            // this.processKeyboardNote(msg);
            this.midiService.sendMessage(msg.type, msg.msg);
        }
    };

    // processKeyboardNote = ({msg, type}: MidiSubjectMessage) => {
    //     if (type !== 'noteon') {
    //         return;
    //     }

    //     if (!('note' in msg)) {
    //         return;
    //     }

    //     console.log(msg.note)
    //     if (msg.note < 32) {
    //         this.app.actions.setRandomColor();
    //     }
    // }

    handleKeyboardNoteOff = (msg: MidiSubjectMessage) => {
        // console.log('off');

        const inputConfig = this.config.midi.inputs.find((i) => i.name === msg.name);
        if (!inputConfig) {
            return;
        }

        const keyboard = inputConfig.keyboard;
        if (keyboard && equalKeyboard(keyboard, msg)) {
            this.midiService.sendMessage(msg.type, msg.msg);
        }
    };

    handleQwertyEvent = (_key: string) => {
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
    };
}
