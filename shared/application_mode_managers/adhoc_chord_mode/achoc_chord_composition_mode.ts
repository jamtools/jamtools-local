import {Subscription} from 'rxjs';

import type {Note} from 'easymidi';

import MidiService, {MidiSubjectMessage} from '../../services/midi_service';

import {ApplicationModeManager} from '../application_mode_manager';

import type App from '../../app';
import {AdhocProgressionState} from '../../state/progression_state';
import InputChordSupervisor from '../../music/input_chord_supervisor';
import {ControlChangeEvent, equalChords, isNoteOnEvent, NoteOffEvent, NoteOnEvent} from '../../midi';

export default class AdhocChordCompositionMode implements ApplicationModeManager<AdhocProgressionState> {
    private state: AdhocProgressionState = {
        chords: [],
        currentIndex: -1,
        mode: 'composition',
    };

    private sustainPedalSubscription: Subscription;
    private mainTriggerSubscription: Subscription;
    private musicalKeyboardSubscription: Subscription;

    storedChords: Note[][] = [];

    constructor(
        private midiService: MidiService,
        private app: App,
    ) {
        // this.inputChordSupervisor = new InputChordSupervisor(midiService);
        this.mainTriggerSubscription = midiService.subscribeToMainTrigger(this.handleMainTrigger);
        this.musicalKeyboardSubscription = midiService.subscribeToMusicalKeyboard(this.handleMusicalKeyboardNote);
        this.sustainPedalSubscription = midiService.subscribeToSustainPedal(this.handleSustainPedalPress, this.handleSustainPedalRelease);
    }

    private inputChordSupervisor = new InputChordSupervisor(this.midiService);

    public close = () => {
        this.mainTriggerSubscription.unsubscribe();
        this.musicalKeyboardSubscription.unsubscribe();
        this.sustainPedalSubscription.unsubscribe();
        this.inputChordSupervisor.close();
    };

    getState = (): AdhocProgressionState => this.state;

    private setState = (partialState: Partial<AdhocProgressionState>) => {
        this.state = {
            ...this.state,
            ...partialState,
        };

        this.app.broadcastState();
    };

    // add config settings to midi configs:
    // - subscribesToNotes: {}
    // - subscribesToChords: {}
    // - providesNotes: {}
    // so you can assign roles to each instrument

    // slim down current config. make a new config file but also keep old one

    private handleFinalConfirm = () => {
        console.log('final confirm');
        this.app.changeModeAdhocPlayback(this.state);
    };

    private handleMainTrigger = (event: MidiSubjectMessage<NoteOnEvent>) => {
        // Nothing to do in this mode
        console.log('no-op main trigger', event);
    };

    private handleMusicalKeyboardNote = (event: MidiSubjectMessage<NoteOnEvent | NoteOffEvent>) => {
        if (isNoteOnEvent(event)) {
            this.handleMusicalKeyboardNoteOn(event);
            return;
        }

        this.handleMusicalKeyboardNoteOff(event);
    };

    private sustainIsPressed = false;
    private currentSustainedNotes: Note[] = [];
    private handleSustainPedalPress = (_event: MidiSubjectMessage<ControlChangeEvent>) => {
        this.sustainIsPressed = true;

        const currentNotes = this.inputChordSupervisor.getCurrentlyHeldDownNotes();
        if (!currentNotes.length) {
            return;
        }

        const previousChord = this.state.chords[this.state.chords.length - 1];

        if (previousChord && equalChords(previousChord, currentNotes)) {
            this.handleFinalConfirm();
            return;
        }

        console.log('add chord');
        const newChords = [...this.state.chords, currentNotes];
        this.setState({
            chords: newChords,
            currentIndex: this.state.chords.length - 1,
        });
    };

    private handleSustainPedalRelease = (_event: MidiSubjectMessage<ControlChangeEvent>) => {
        this.sustainIsPressed = false;

        const currentNotes = this.inputChordSupervisor.getCurrentlyHeldDownNotes();
        this.midiService.notesOffExceptFor(currentNotes);
    };

    handleMusicalKeyboardNoteOn = (msg: MidiSubjectMessage<NoteOnEvent>) => {
        if (!this.currentSustainedNotes.includes(msg.msg)) {
            this.currentSustainedNotes.push(msg.msg);
        }

        this.midiService.sendMessage(msg.type, msg.msg);
    };

    handleMusicalKeyboardNoteOff = (msg: MidiSubjectMessage<NoteOffEvent>) => {
        if (this.sustainIsPressed) {
            return;
        }

        this.midiService.sendMessage(msg.type, msg.msg);
    };
}
