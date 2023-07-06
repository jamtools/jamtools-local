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

export default class AdhocChordPlaybackMode implements ApplicationModeManager<AdhocProgressionState> {
    private sustainPedalSubscription: Subscription;
    private mainTriggerSubscription: Subscription;

    storedChords: Note[][] = [];

    constructor(
        private state: AdhocProgressionState,
        private midiService: MidiService,
        private app: App,
    ) {
        this.mainTriggerSubscription = midiService.subscribeToMainTrigger(this.handleMainTrigger);
        this.sustainPedalSubscription = midiService.subscribeToSustainPedal(this.handleSustainPedalPress, this.handleSustainPedalRelease);

        state.currentIndex = this.state.chords.length - 1
        const lastChord = this.state.chords[state.currentIndex];
        if (lastChord) {
            const notes = lastChord.map(n => n.note);
            this.app.playSpecificChord(notes);
        }
    }

    private inputChordSupervisor = new InputChordSupervisor(this.midiService);

    public close = () => {
        this.mainTriggerSubscription.unsubscribe();
        // this.musicalKeyboardSubscription.unsubscribe();
        // this.sustainPedalSubscription.unsubscribe();
        this.inputChordSupervisor.close();
    }

    private handleSustainPedalPress = (event: MidiSubjectMessage<ControlChangeEvent>) => {
        this.handleMainTrigger(event);
    }

    private handleSustainPedalRelease = (event: MidiSubjectMessage<ControlChangeEvent>) => {
    }

    getState = (): AdhocProgressionState => this.state;

    private setState = (partialState: Partial<AdhocProgressionState>) => {
        this.state = {
            ...this.state,
            ...partialState,
        };

        this.app.broadcastState();
    }

    private handleMainTrigger = (event: MidiSubjectMessage) => {
        console.log('main trigger', event.name)
        const nextIndex = (this.state.currentIndex + 1) % this.state.chords.length;

        const chord = this.state.chords[nextIndex].map(c => c.note);
        this.app.playSpecificChord(chord);
        this.setState({
            currentIndex: nextIndex,
        });
    }
}
