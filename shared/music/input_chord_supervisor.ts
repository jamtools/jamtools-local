import MidiService from '../services/midi_service';

import {Subscription} from 'rxjs';

import {MidiInstrumentName} from '../constants/midi_instrument_constants';
import {isNoteOnEvent, MidiMessage, MidiMessageType, NoteOnEvent} from '../midi';

export type MidiSubjectMessage = {
    name: MidiInstrumentName;
    type: MidiMessageType;
    msg: MidiMessage;
}

type MidiEventHandler = ((msg: MidiSubjectMessage) => void);

export default class InputChordSupervisor {
    private midiServiceSubject: Subscription;

    private heldDownNotes: NoteOnEvent[] = [];

    private midiEventHandlers: {[eventName: string]: MidiEventHandler | undefined} = {
        noteon: () => this.handleNoteOn,
        noteoff: () => this.handleNoteOff,
    }

    constructor(private midi: MidiService) {
        this.midiServiceSubject = midi.subscribe(msg => {
            const handler = this.midiEventHandlers[msg.type];
            if (handler) {
                handler(msg);
            }
        });
    }

    close = () => {
        this.midiServiceSubject.unsubscribe();
    }

    handleNoteOn: MidiEventHandler = (event) => {
        if (!isNoteOnEvent(event)) {
            return;
        }

        if (event.msg.velocity === 0) {
            this.handleNoteOff({
                ...event,
                type: 'noteoff',
            });
            return;
        }

        const current = this.getCurrentlyHeldDownNotes();
        let next: NoteOnEvent[];

        const index = current.findIndex(n => n.note === event.msg.note)
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
            ]
        }

        this.heldDownNotes = next;
    }

    handleNoteOff: MidiEventHandler = (event) => {
        const msg = event.msg
        if (!isNoteOffEvent(event.type, msg)) {
            return;
        }

        const current = this.getCurrentlyHeldDownNotes();

        const index = current.findIndex(n => n.note === msg.note)
        if (index !== -1) {
            this.heldDownNotes = [
                ...current.slice(0, index),
                ...current.slice(index + 1),
            ];
        }
    }

    getCurrentlyHeldDownNotes = (): NoteOnEvent[] => {
        return this.heldDownNotes;
    }

    playChord = (nextChord: number[]) => {
        // nextChord = nextChord.slice(0, 4);

        const toRelease = this.heldDownNotes.filter(note => !nextChord.includes(note));
        const toPress = nextChord.filter(note => !this.heldDownNotes.includes(note));
        this.heldDownNotes = nextChord;

        toRelease.forEach(note => {
            this.midi.sendMessage('noteoff', {
                channel: 0,
                note,
                velocity: 0,
            });
        });

        toPress.forEach(note => {
            this.midi.sendMessage('noteon', {
                channel: 0,
                note,
                velocity: 100,
            });
        });
    }
}
