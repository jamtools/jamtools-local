import {Input, Output} from 'easymidi';

let currentChordIndex = 0; // index of current chord being played back
let tickCount = 0; // number of MIDI clock ticks received
let ticksPerQuarterNote = 24; // assume default value of 24 MIDI clock ticks per quarter note

let currentNotes: number[] = []; // array of currently held down notes
let lastNotePosition = 0; // position (in ticks) of the last held down note
let chords: Note[][] = []; // array of saved chords

let nextPlaybackPosition = 0; // position (in ticks) of the next chord playback
let playbackScheduled = false; // whether a chord playback has been scheduled

const input = new Input('IAC Driver Bus 1');
const output = new Output('IAC Driver Bus 1');

// listen for MIDI clock messages and update tick count
input.on('clock', () => {
    tickCount++;

    if (playbackScheduled && tickCount >= nextPlaybackPosition) {
        playNextChord();
    }
});

// listen for sustain pedal messages
input.on('cc', (msg) => {
    if (msg.controller !== 64) return; // ignore other control messages

    if (msg.value === 127 && currentNotes.length > 0) {
        // sustain pedal pressed, save current chord
        const currentChord = {
            notes: currentNotes.slice(),
            position: lastNotePosition % (ticksPerQuarterNote * 2) // save chord position relative to 1/8 note
        };
        chords.push(currentChord);

        // reset playback position and cancel scheduled playback
        currentChordIndex = 0;
        nextPlaybackPosition = 0;
        playbackScheduled = false;
    } else if (msg.value === 127 && currentNotes.length === 0) {
        // sustain pedal pressed with no current notes, schedule next playback
        if (chords.length > 0) {
            nextPlaybackPosition = Math.ceil(tickCount / ticksPerQuarterNote) * ticksPerQuarterNote; // round up to nearest quarter note
            playbackScheduled = true;
        }
    }
});

// listen for note on/off messages and update current notes and lastNotePosition
input.on('noteon', (msg) => {
    currentNotes.push(msg.note);
    lastNotePosition = tickCount;
});

input.on('noteoff', (msg) => {
    const noteIndex = currentNotes.indexOf(msg.note);
    if (noteIndex !== -1) {
        currentNotes.splice(noteIndex, 1);
    }
});

// play the next chord in the sequence and schedule the next playback
function playNextChord() {
    const chord = chords[currentChordIndex];
    output.send('noteoff', {velocity: 0, channel: 1, note: chord.notes});
    output.send('noteon', {velocity: 127, channel: 1, note: chord.notes});
    currentChordIndex = (currentChordIndex + 1) % chords.length;
    nextPlaybackPosition += ticksPerQuarterNote * 4; // advance to next quarter note
}
