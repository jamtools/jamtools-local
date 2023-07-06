import {Input, Output, PolyAfterTouch, Note, getInputs} from 'easymidi';

class MidiLooper {
    private input: Input;
    private output: Output;

    private isRecording = false;
    private currentChord: Note[] = [];
    private savedChords: Note[][] = [];

    private lastClockTime = 0;
    private currentStep = -1;
    private shouldPlay = false;
    private _ticks = 0;

    constructor() {
        getInputs().forEach(console.log);
        this.input = new Input('IAC Driver Bus 1');
        this.output = new Output('IAC Driver Bus 1');

        this.input.on('start', this.handleStart);
        this.input.on('stop', this.handleStop);
        this.input.on('clock', this.handleClock);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.input.on('cc' as any, this.handlePedal);
        this.input.on('noteon', this.handleNoteOn);
        this.input.on('noteoff', this.handleNoteOff);
    }

    private handleStart = (): void => {
        this.currentStep = -1;
        this._ticks = 0;
        this.shouldPlay = true;
        this.output.send('start');
    };

    private handleStop = (): void => {
        this.currentStep = -1;
        this.shouldPlay = false;
        this.output.send('stop');
    };

    private handleClock = (): void => {
        const now = Date.now();
        if (now - this.lastClockTime > 1000) {
            this.currentStep = -1;
            this.shouldPlay = true;
            this._ticks = 0;
        }

        this._ticks++;
        this.lastClockTime = now;

        if (!this.shouldPlay) {
            return;
        }

        this.currentStep = (this.currentStep + 1) % this.savedChords.length;

        this.savedChords[this.currentStep].forEach((note) => {
            this.output.send('noteon', note);
        });
    };

    private handlePedal = (msg: PolyAfterTouch): void => {
        if (msg.note <= 63) {
            return;
        }

        if (this.currentChord.length) {
            this.savedChords.push(this.currentChord);
            this.currentChord = [];
            this.isRecording = false;
        } else {
            this.shouldPlay = true;
        }

        const isPress = msg.note === 127;
        if (!isPress) {
            return;
        }

        if (!this.currentChord.length) {
            if (chords.length > 0) {
                nextPlaybackPosition = Math.ceil(tickCount / ticksPerQuarterNote) * ticksPerQuarterNote; // round up to nearest quarter note
                playbackScheduled = true;
            }
            return;
        }

        // sustain pedal pressed, save current chord
        const currentChord = {
            notes: currentNotes.slice(),
            position: lastNotePosition % (ticksPerQuarterNote * 2), // save chord position relative to 1/8 note
        };
        chords.push(currentChord);

        // reset playback position and cancel scheduled playback
        currentChordIndex = 0;
        nextPlaybackPosition = 0;
        playbackScheduled = false;
    };

    private handleNoteOn = (note: Note): void => {
        if (!this.isRecording) {
            return;
        }

        this.currentChord.push(note);
    };

    private handleNoteOff = (note: Note): void => {
        if (!this.isRecording) {
            return;
        }

        this.currentChord = this.currentChord.filter((n) => n.note !== note.note);
    };
}

const _looper = new MidiLooper();
