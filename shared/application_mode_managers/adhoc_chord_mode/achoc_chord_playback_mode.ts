import {Subscription} from 'rxjs';
import type {Note} from 'easymidi';

import MidiService, {MidiSubjectMessage} from '../../io/midi/midi_service';

import {ApplicationModeManager} from '../application_mode_manager';

import type App from '../../app';
import {AdhocProgressionState} from '../../state/progression_state';
import InputChordSupervisor from '../../io/midi/input_chord_supervisor';
import {ControlChangeEvent} from '../../io/midi/midi_utls';

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

        state.currentIndex = this.state.chords.length - 1;
        const lastChord = this.state.chords[state.currentIndex];
        if (lastChord) {
            const notes = lastChord.map((n) => n.note);
            // this.app.playSpecificChord(notes);
        }
    }

    private inputChordSupervisor = new InputChordSupervisor(this.midiService);

    public close = () => {
        this.mainTriggerSubscription.unsubscribe();
        // this.musicalKeyboardSubscription.unsubscribe();
        // this.sustainPedalSubscription.unsubscribe();
        this.inputChordSupervisor.close();
    };

    private handleSustainPedalPress = (event: MidiSubjectMessage<ControlChangeEvent>) => {
        this.handleMainTrigger(event);
    };

    private handleSustainPedalRelease = (_event: MidiSubjectMessage<ControlChangeEvent>) => {
    };

    getState = (): AdhocProgressionState => this.state;

    private setState = (partialState: Partial<AdhocProgressionState>) => {
        this.state = {
            ...this.state,
            ...partialState,
        };

        this.app.broadcastState();
    };

    private handleMainTrigger = (event: MidiSubjectMessage) => {
        console.log('main trigger', event.name);
        const nextIndex = (this.state.currentIndex + 1) % this.state.chords.length;

        const chord = this.state.chords[nextIndex].map((c) => c.note);
        this.app.playSpecificChord(chord);
        this.setState({
            currentIndex: nextIndex,
        });
    };
}
