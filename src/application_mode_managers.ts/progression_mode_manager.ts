import easymidi from 'easymidi';
import {Subscription} from 'rxjs';
import {CHORDS} from '../constants/chord_constants';
import ChordSupervisor from '../music/chord_supervisor';

import MidiService, {MidiSubjectMessage} from '../services/midi_service';
import WledService from '../services/wled_service';
import {Config} from '../types/config_types';

import {ModeManager} from '../types/mode_manager_types';
import {ControlButtonMapping, KeyboardMapping} from '../types/trigger_types';

type Action = ((msg: MidiSubjectMessage) => void) | undefined;

const progressions: number[][][] = [
    [
        CHORDS.bMajor7,
        CHORDS.eMajor7,
    ],
    [
        CHORDS.gsMinor,
        CHORDS.eMajor,
        CHORDS.fsMajor,
    ],
    [
        CHORDS.eMajor7,
        CHORDS.gsMinor,
    ],
];

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
    private actions: Action[];
    private eventHandlers: {[eventName: string]: Action};
    private currentProgression = 0;
    private currentChord = 0;
    private chordSupervisor: ChordSupervisor;
    private currentPreset = 0;

    private subject: Subscription;

    constructor(
        private midiService: MidiService,
        private wledService: WledService,
        private config: Config
    ) {
        // SPD: 0 6 2 3
        this.actions = [
            this.playChord,
            this.noteOffAll,
            this.nextProgressionAndPreset,
            this.playChordAndChangePreset,
            this.setRandomColor,
            this.setRandomEffect,
            this.playChordAndChangeColor,
            undefined,
        ];

        this.eventHandlers = {
            'noteon': this.handleKeyboardNoteOn,
            'noteoff': this.handleKeyboardNoteOff,
            'cc': this.handleControlKnob,
        };

        this.subject = midiService.subscribe(msg => {
            const handler = this.eventHandlers[msg.type];
            if (handler) {
                handler(msg);
            }
        });

        this.chordSupervisor = new ChordSupervisor(midiService);
    }

    close = () => this.subject.unsubscribe();

    private playChord = () => {
        const progression = progressions[this.currentProgression];

        const chord = progression[this.currentChord];
        this.currentChord = (this.currentChord + 1) % progression.length;

        this.chordSupervisor.playChord(chord);
        const name = Object.keys(CHORDS).find(key => CHORDS[key] === chord);
        console.log('playing chord ' + name);
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
        const presetIndex = (this.currentPreset + 1) % wledPresets.length;
        this.currentPreset = presetIndex;
        const preset = wledPresets[presetIndex];
        this.wledService.setPreset(preset);
    }

    private playChordAndChangeColor = (msg: MidiSubjectMessage) => {
        this.playChord();
        this.setRandomColor();
    }

    private playChordAndChangePreset = (msg: MidiSubjectMessage) => {
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

        const controlButtons = inputConfig.controlButtons;
        if (controlButtons?.length) {
            const control = controlButtons.find(button => equalControlButton(button, msg));
            if (control) {
                const index = controlButtons.indexOf(control);
                const action = this.actions[index];
                if (!action) {
                    console.warn(`Undefined action for control button ${JSON.stringify(control)}`)
                    return;
                }

                // console.log(`Running action ${index}`);
                action(msg);
                return;
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
}

export const equalControlButton = (button: ControlButtonMapping, msg: MidiSubjectMessage) => {
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
