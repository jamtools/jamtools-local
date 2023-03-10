import {Subscription} from 'rxjs';
import MidiService, {MidiSubjectMessage} from '../services/midi_service';

export default class MidiRecordHandler {
    private midiSubscription: Subscription;

    private currentHeldDownNotes: {[midiName: string]: number[]} = {};

    constructor(private midiService: MidiService) {
        this.midiSubscription = midiService.subscribe(this.handleMidiEvent);
    }

    handleMidiEvent = (message: MidiSubjectMessage) => {
        this.currentHeldDownNotes[message.name] = this.currentHeldDownNotes[message.name]
    }

    close = () => this.midiSubscription.unsubscribe();
}
