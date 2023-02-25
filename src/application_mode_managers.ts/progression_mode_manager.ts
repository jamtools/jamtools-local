import easymidi from 'easymidi';
import {Subscription} from 'rxjs';
import {CHORDS} from '../constants/chord_constants';
import {set1, set2} from '../constants/progression_constants';
import BluetoothRemoteDynamicMapping from '../dynamic_mappings/qwerty_dynamic_mappings';
import ChordSupervisor from '../music/chord_supervisor';

import MidiService, {MidiSubjectMessage} from '../services/midi_service';
import QwertyService from '../services/qwerty_service';
import WledService from '../services/wled_service';
import {Config} from '../types/config_types/config_types';

import {ModeManager} from '../types/mode_manager_types';
import {ControlButtonMapping, KeyboardMapping} from '../types/trigger_types';
import {log} from '../utils';

type MidiEventHandler = ((msg: MidiSubjectMessage) => void) | undefined;

// const progressions = setu2;
const progressions = set1;

const wledPresets = [
    3,
    5,
    6,
    7,
    8,
    9,
    10,
];

export default class ProgressionModeManager implements ModeManager {
    private actions: MidiEventHandler[];
    private midiEventHandlers: {[eventName: string]: MidiEventHandler};
    private currentProgression = 0;
    private currentChord = 0;
    private chordSupervisor: ChordSupervisor;
    private currentPreset = 0;

    private midiServiceSubject: Subscription;
    private qwertyServiceSubject: Subscription;

    private dynamicMapping: BluetoothRemoteDynamicMapping;

    constructor(
        private midiService: MidiService,
        private wledService: WledService,
        private qwertyService: QwertyService,
        private config: Config
    ) {
        this.actions = [
            this.playChordAndChangePreset,
            this.playChordAndChangeColor,
            // this.setRandomColor,
            this.nextPreset,
            this.playChordAndChangePreset,
            this.nextProgressionAndPreset,
            this.noteOffAll,
            this.setRandomEffect,
            this.playChordAndChangeColor,
            this.savePreset,
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

        this.qwertyServiceSubject = this.qwertyService.subscribe(key => {
            // this.handleQwertyEvent(key);
        });

        this.chordSupervisor = new ChordSupervisor(midiService);
        this.dynamicMapping = new BluetoothRemoteDynamicMapping([
            {
                name: 'play chord',
                func: this.playChord,
            },
            {
                name: 'play chord and change color',
                func: this.playChordAndChangeColor,
            },
            {
                name: 'play chord and change preset',
                func: this.playChordAndChangePreset,
            },
        ], {
            name: 'change progression and change preset',
            func: this.nextProgressionAndPreset,
        }, this.qwertyService);
    }

    close = () => {
        this.midiServiceSubject.unsubscribe();
        this.qwertyServiceSubject.unsubscribe();
        this.dynamicMapping.close();
    }

    private playChord = () => {
        const progression = progressions[this.currentProgression];

        const chord = progression[this.currentChord];
        this.currentChord = (this.currentChord + 1) % progression.length;

        this.chordSupervisor.playChord(chord);
        const name = Object.keys(CHORDS).find(key => CHORDS[key] === chord);
        setTimeout(() => console.log('playing chord ' + name), );
    }

    private nextProgression = () => {
        this.currentProgression = (this.currentProgression + 1) % progressions.length;
        this.currentChord = 0;
        this.playChord();
    }

    private nextProgressionAndPreset = () => {
        this.nextProgression();
        this.nextPreset();
    }

    private nextPreset = () => {
        // const presetIndex = (this.currentPreset + 1) % wledPresets.length;
        // this.currentPreset = presetIndex;
        // const preset = wledPresets[presetIndex];
        // this.wledService.setPreset(preset);
        // console.log('next preset')
        this.wledService.setRandomPreset()
    }

    private savePreset = () => {
        // button to save current state as preset
        // this.wledService.
    };

    private playChordAndChangeColor = () => {
        this.playChord();
        this.setRandomColor();
    }

    private playChordAndChangePreset = () => {
        console.log(1000)
        this.playChord();
        this.nextPreset();
    }

    private noteOffAll = (msg: MidiSubjectMessage) => {
        this.midiService.notesOffAll();
    }

    private setRandomColor = () => {
        this.wledService.setRandomColor();
    }

    private setRandomEffect = (msg: MidiSubjectMessage) => {
        this.wledService.setRandomEffect();
    }

    handleControlKnob = (msg: MidiSubjectMessage) => {
    }

    handleKeyboardNoteOn = (msg: MidiSubjectMessage) => {
        const inputConfig = this.config.midi.inputs.find(i => i.name === msg.name);
        if (!inputConfig) {
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
        console.log(key);

        const actions = {
            u: this.setRandomColor,
            h: this.setRandomEffect,
            w: this.increaseWledSpeed,
            x: this.decreaseWledSpeed,
            p: this.playChord,
        };

        const action = actions[key];
        if (action) {
            log('running action for ' + key);
            action();
        }
    }

    increaseWledSpeed = () => {
        this.wledService.increaseSpeed();
    }

    decreaseWledSpeed = () => {
        this.wledService.decreaseSpeed();
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
