import {Subscription} from 'rxjs';

import MidiService, {MidiSubjectMessage} from '../../services/midi_service';
import {Config} from '../../types/config_types/config_types';

import {ApplicationModeManager} from '../application_mode_manager';
import {log} from '../../utils';

import type App from '../../app';
import {MidiInstrumentName} from '../../constants/midi_instrument_constants';
import {AdhocProgressionState, ProgressionState} from '../../state/progression_state';
import InputChordSupervisor from '../../music/input_chord_supervisor';
import {ControlChangeEvent, isNoteOnEvent, NoteOffEvent, NoteOnEvent} from '../../midi';
import {Note} from 'easymidi';

export default class AdhocChordCompositionMode implements ApplicationModeManager<AdhocProgressionState> {
    private state: AdhocProgressionState = {};

    private sustainPedalSubscription: Subscription;
    private mainTriggerSubscription: Subscription;
    private musicalKeyboardSubscription: Subscription;
    private inputChordSupervisor = new InputChordSupervisor(this.midiService);

    constructor(
        private midiService: MidiService,
        private config: Config,
        private app: App,
    ) {
        this.inputChordSupervisor = new InputChordSupervisor(midiService);
        this.sustainPedalSubscription = midiService.subscribeToSustainPedal(this.handleSustainPedalPress, this.handleSustainPedalRelease);
        this.mainTriggerSubscription = midiService.subscribeToMainTrigger(this.handleMainTrigger);
        this.musicalKeyboardSubscription = midiService.subscribeToMusicalKeyboard(this.handleMusicalKeyboardNote);
    }

    getState = (): AdhocProgressionState => this.state;

    private setState = (partialState: Partial<AdhocProgressionState>) => {
        this.state = {
            ...this.state,
            ...partialState,
        };
    }

    // add config settings to midi configs:
    // - subscribesToNotes: {}
    // - subscribesToChords: {}
    // - providesNotes: {}
    // so you can assign roles to each instrument

    // slim down current config. make a new config file but also keep old one

    public close = () => {
        this.mainTriggerSubscription.unsubscribe();
        this.musicalKeyboardSubscription.unsubscribe();
        this.sustainPedalSubscription.unsubscribe();
    }

    private handleMainTrigger = (event: MidiSubjectMessage<NoteOnEvent>) => {
        // TODO
    }

    private handleMusicalKeyboardNote = (event: MidiSubjectMessage<NoteOnEvent | NoteOffEvent>) => {
        if (isNoteOnEvent(event)) {
            this.handleMusicalKeyboardNoteOn(event);
            return;
        }

        this.handleMusicalKeyboardNoteOff(event);
    }

    private sustainIsPressed = false;
    private currentSustainedNotes: Note[] = [];
    private handleSustainPedalPress = (event: MidiSubjectMessage<ControlChangeEvent>) => {
        this.sustainIsPressed = true;
    }

    private handleSustainPedalRelease = (event: MidiSubjectMessage<ControlChangeEvent>) => {
        const currentNotes = this.inputChordSupervisor.getCurrentlyHeldDownNotes();
        this.midiService.notesOffExceptFor(currentNotes);

        this.sustainIsPressed = false;
    }

    handleMusicalKeyboardNoteOn = (msg: MidiSubjectMessage<NoteOnEvent>) => {
        if (!this.currentSustainedNotes.includes(msg.msg)) {
            this.currentSustainedNotes.push(msg.msg);
        }

        // always send a note on, even if it's already being held down by the instrument via sustain
        // this way, juno doesn't stop playing that one at 6 count limit
        this.midiService.sendMessage(msg.type, msg.msg);
    }

    handleMusicalKeyboardNoteOff = (msg: MidiSubjectMessage<NoteOffEvent>) => {
        if (this.sustainIsPressed) {
            return;
        }

        this.midiService.sendMessage(msg.type, msg.msg);
    }
}
