import {Subscription} from 'rxjs';

import MidiService, {MidiSubjectMessage} from '../../services/midi_service';
import {Config} from '../../types/config_types/config_types';

import {ModeManager} from '../../types/mode_manager_types';
import {log} from '../../utils';

import type App from '../../app';
import {MidiInstrumentName} from '../../constants/midi_instrument_constants';
import {AdhocProgressionState, ProgressionState} from '../../state/progression_state';
import InputChordSupervisor from 'music/input_chord_supervisor';
import {ControlChangeEvent} from 'midi';

type MidiEventHandler = ((msg: MidiSubjectMessage) => void) | undefined;

export default class AdhocChordCompositionMode implements ModeManager {
    private state: AdhocProgressionState = {};

    private midiServiceSubject: Subscription;
    private sustainPedalSubscription: Subscription;
    private inputChordSupervisor = new InputChordSupervisor(this.midiService);

    // need to make sure we account for sustain pedal blocking the held out chord from "noteoffs"
    // we should ask InputChordSupervisor what notes are currently being held down when we release the sustain pedal
    // if any of them are missing from the "sustain held" notes, send noteoff events for all not held down notes
    // always send a note on, even if it's already being held down by the instrument via sustain. this way juno doesn't stop playing that one at 6 count limit

    constructor(
        private midiService: MidiService,
        private config: Config,
        private app: App,
    ) {

        // actions are the same on UI and midi keyboard
        // A1 A2 A3 A4
        // B1 B2 B3 B4

        // this.actions = [
        //     this.app.actions.toggleDrumsMusicAction,
        //     this.app.actions.noteOffAll,
        //     this.app.actions.setRandomColor,
        //     this.app.actions.nextPreset,
        //     this.nextSong,
        //     this.playChordAndChangeColor,
        //     this.playChordAndChangePreset,
        //     this.playChordAndChangePreset,
        //     this.nextProgressionAndPreset,
        //     this.app.actions.setRandomEffect,
        // ];

        // this.midiEventHandlers = {
        //     'noteon': this.handleKeyboardNoteOn,
        //     'noteoff': this.handleKeyboardNoteOff,
        //     'cc': this.handleControlKnob,
        // };

        // this.midiServiceSubject = midiService.subscribe(msg => {
        //     const handler = this.midiEventHandlers[msg.type];
        //     if (handler) {
        //         handler(msg);
        //     }
        // });

        this.inputChordSupervisor = new InputChordSupervisor(midiService);
        this.sustainPedalSubscription = midiService.subscribeToSustainPedal(this.handleSustainPedalPress, this.handleSustainPedalRelease);
    }

    getState = (): AdhocProgressionState => this.state;

    private setState = (partialState: Partial<AdhocProgressionState>) => {
        this.state = {
            ...this.state,
            ...partialState,
        };
    }

    // toggleDrumColorAction = () => {
    //     this.setState({
    //         shouldDrumsChangeColor: !this.state.shouldDrumsChangeColor,
    //     });
    // }

    // toggleDrumMusicAction = () => {
    //     this.setState({
    //         shouldDrumsChangeProgression: !this.state.shouldDrumsChangeProgression,
    //     });
    // }

    public close = () => {
        this.midiServiceSubject.unsubscribe();
        this.sustainPedalSubscription.unsubscribe();
    }

    private sustainIsPressed = false;

    private handleSustainPedalPress = (event: MidiSubjectMessage<ControlChangeEvent>) => {
        this.sustainIsPressed = true;
    }

    private handleSustainPedalRelease = (event: MidiSubjectMessage<ControlChangeEvent>) => {
        const currentNotes = this.inputChordSupervisor.getCurrentlyHeldDownNotes();


        this.sustainIsPressed = false;
    }

    lastTimeAction = {};
    handleKeyboardNoteOn = (msg: MidiSubjectMessage) => {
        // console.log('on');

        const {shouldDrumsChangeColor, shouldDrumsChangeProgression} = this.state;

        const inputConfig = this.config.midi.inputs.find(i => i.name === msg.name);
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
            // this.processKeyboardNote(msg);
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
