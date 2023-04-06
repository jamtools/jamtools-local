import MidiService from '../services/midi_service';

export class OutputChordSupervisor {
    heldDownNotes: number[] = [];

    constructor(private midi: MidiService) {

    }

    notesOffAll = () => {
        this.heldDownNotes = [];
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
