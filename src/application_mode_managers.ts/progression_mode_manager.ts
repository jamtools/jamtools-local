import easymidi from 'easymidi';
import {Subscription} from 'rxjs';
import {MidiMessage, MidiMessageType} from '../midi';

import MidiService, {MidiSubjectMessage} from '../services/midi_service';
import WledService from '../services/wled_service';
import {Config} from '../types/config_types';

import {ModeManager} from '../types/mode_manager_types';
import {ControlButtonMapping, KeyboardMapping} from '../types/trigger_types';

type Action = ((msg: MidiSubjectMessage) => void) | undefined;

export default class ProgressionModeManager implements ModeManager {
    private actions: Action[];
    private eventHandlers: {[eventName: string]: Action};

    private subject: Subscription;

    constructor(
        private midiService: MidiService,
        private wledService: WledService,
        private config: Config
    ) {
        this.actions = [
            this.playChord,
            undefined,
            undefined,
            undefined,
            this.changeLights,
            undefined,
            undefined,
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
    }

    close = () => this.subject.unsubscribe();

    private playChord = (msg: MidiSubjectMessage) => {
        console.log('playing chord')
        this.midiService.sendMessage('noteon', {
            channel: 9, note: 40, velocity: 114
        })
    }

    private changeLights = (msg: MidiSubjectMessage) => {
        console.log('changing lights');
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

                console.log(`Running action ${index}`);
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
    const noteMsg = msg.msg as easymidi.Note;
    return button.channel === noteMsg.channel && button.note === noteMsg.note;
};

export const equalKeyboard = (keyboard: KeyboardMapping, msg: MidiSubjectMessage) => {
    const noteMsg = msg.msg as easymidi.Note;
    return keyboard.channel === noteMsg.channel;
};
