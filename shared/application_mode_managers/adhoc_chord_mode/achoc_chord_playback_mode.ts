import {Subscription} from 'rxjs';
import type {Note} from 'easymidi';

import MidiService, {MidiSubjectMessage} from '../../services/midi_service';
import {Config} from '../../types/config_types/config_types';

import {ApplicationModeManager} from '../application_mode_manager';
import {log} from '../../utils';

import type App from '../../app';
import {MidiInstrumentName} from '../../constants/midi_instrument_constants';
import {AdhocProgressionState, ProgressionState} from '../../state/progression_state';
import InputChordSupervisor from '../../music/input_chord_supervisor';
import {ControlChangeEvent, equalChords, isNoteOnEvent, NoteOffEvent, NoteOnEvent} from '../../midi';

type Chords = Note[][];

export default class AdhocChordPlaybackMode implements ApplicationModeManager<AdhocProgressionState> {
    private state: AdhocProgressionState = {};

    private sustainPedalSubscription: Subscription;
    private mainTriggerSubscription: Subscription;
    private musicalKeyboardSubscription: Subscription;

    private currentIndex = -1;

    storedChords: Note[][] = [];

    constructor(
        private chords: Chords,
        private midiService: MidiService,
        private config: Config,
        private app: App,
        ) {
            // this.inputChordSupervisor = new InputChordSupervisor(midiService);
            this.mainTriggerSubscription = midiService.subscribeToMainTrigger(this.handleMainTrigger);
            // this.musicalKeyboardSubscription = midiService.subscribeToMusicalKeyboard(this.handleMusicalKeyboardNote);
            // this.sustainPedalSubscription = midiService.subscribeToSustainPedal(this.handleSustainPedalPress, this.handleSustainPedalRelease);

            // if this playback mode receives a sustain release before a sustain press on object instantiation,
            // we should send note offs to all notes except current chord
            // this way the last registered chord can ring out into first chord playing
        }

    private inputChordSupervisor = new InputChordSupervisor(this.midiService);

    public close = () => {
        this.mainTriggerSubscription.unsubscribe();
        this.musicalKeyboardSubscription.unsubscribe();
        this.sustainPedalSubscription.unsubscribe();
        this.inputChordSupervisor.close();
    }

    getState = (): AdhocProgressionState => this.state;

    private setState = (partialState: Partial<AdhocProgressionState>) => {
        this.state = {
            ...this.state,
            ...partialState,
        };
    }

    private handleFinalConfirm = () => {
        // DO THIS NEXT
        // console.log('final confirm');

        // this should instantiate a AdhocChordPlaybackMode object and send it to App from an exposed method
        // this.close(); // maybe do this in App instead?
    }

    private handleMainTrigger = (event: MidiSubjectMessage<NoteOnEvent>) => {
        console.log('main trigger')
        this.currentIndex = (this.currentIndex + 1) % this.chords.length;

        const chord = this.chords[this.currentIndex].map(c => c.note);
        this.app.playSpecificChord(chord);
    }
}
