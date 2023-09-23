import {Subscription} from 'rxjs';

import MidiService from './midi_service';

import {MidiInstrumentName} from '../../constants/midi_instrument_constants';
import {isNoteOffEvent, isNoteOnEvent, MidiMessage, MidiMessageType, NoteOnEvent} from './midi_utls';

export type MidiSubjectMessage = {
    name: MidiInstrumentName;
    type: MidiMessageType;
    msg: MidiMessage;
}

type MidiEventHandler = ((msg: MidiSubjectMessage) => void);

export default class InputChordSupervisor {
    private midiServiceSubject: Subscription;

    private heldDownNotes: NoteOnEvent[] = [];

    private midiEventHandlers: {[eventName: string]: MidiEventHandler | undefined};

    constructor(private midi: MidiService) {
        this.midiEventHandlers = {
            noteon: this.handleNoteOn,
            noteoff: this.handleNoteOff,
        };

        this.midiServiceSubject = midi.subscribeToMusicalKeyboard((msg) => {
            const handler = this.midiEventHandlers[msg.type];
            if (handler) {
                handler(msg);
            }
        });
    }

    close = () => {
        this.midiServiceSubject.unsubscribe();
    };

    handleNoteOn: MidiEventHandler = (event) => {
        if (!isNoteOnEvent(event)) {
            return;
        }

        const current = this.getCurrentlyHeldDownNotes();
        let next: NoteOnEvent[];

        const index = current.findIndex((n) => n.note === event.msg.note);
        if (index !== -1) {
            next = [
                ...current.slice(0, index),
                ...current.slice(index + 1),
                event.msg,
            ];
        } else {
            next = [
                ...current,
                event.msg,
            ];
        }

        this.heldDownNotes = next;
    };

    handleNoteOff: MidiEventHandler = (event) => {
        if (!isNoteOffEvent(event)) {
            return;
        }

        const current = this.getCurrentlyHeldDownNotes();

        const index = current.findIndex((n) => n.note === event.msg.note);
        if (index !== -1) {
            this.heldDownNotes = [
                ...current.slice(0, index),
                ...current.slice(index + 1),
            ];
        }
    };

    getCurrentlyHeldDownNotes = (): NoteOnEvent[] => {
        return this.heldDownNotes;
    };
}
