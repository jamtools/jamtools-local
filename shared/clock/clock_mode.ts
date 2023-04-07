import type {ControlChange} from 'easymidi';
import {Subscription} from 'rxjs';
import MidiService, {MidiSubjectMessage} from '../services/midi_service';

const PULSES_PER_MEASURE = 96;

const eigthNotePulse = 96 / 8; // 12

// figure out that the music has started

export default class ClockMode {
    private midiSubscription: Subscription;

    lastPulses: number[] = [];
    index = 0;

    private currentHeldDownNotes: {[midiName: string]: number[]} = {};

    constructor(private midiService: MidiService) {
        this.midiSubscription = midiService.subscribe(this.handleMidiEvent);
    }

    handleClockEvent = () => {
        const lastPulse = this.lastPulses[this.lastPulses.length - 1];
        const current = new Date().getTime();

        if (current - lastPulse > 50 * 1000) {
            this.lastPulses = [];
            this.index = 0;
        }

        this.lastPulses.unshift(current);
        this.index++;
        this.lastPulses = this.lastPulses.slice(0, PULSES_PER_MEASURE);

        // not an eigth note
        if (this.index % eigthNotePulse === 0) {
            return;
        }
    }

    handleMidiEvent = (message: MidiSubjectMessage) => {
        if (message.type === 'noteon') {
            // this.currentHeldDownNotes[message.name] = this.currentHeldDownNotes[message.name]
            return;
        }

        if (message.type === 'clock') {
            this.handleClockEvent();
            return;
        }

        if (message.type === 'cc') {
            const controlChange = message.msg as ControlChange;
            if (controlChange.value === 127) {
                this.handlePedal();
            }

            return;
        }
    }

    handlePedal = () => {

    }

    close = () => this.midiSubscription.unsubscribe();
}
