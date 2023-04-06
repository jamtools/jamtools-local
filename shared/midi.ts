import type easymidi from 'easymidi';

import {INPUT_EXTENDED_TYPES, INPUT_TYPES, SPAMMY_MIDI_EVENT_TYPES} from './constants/easymidi_constants';

export const sendNoteToPiano = (output) => {
    output.send('noteoff', {
        note: 64,
        velocity: 40,
        channel: 3,
    });
}

export type MidiMessage = easymidi.ControlChange | easymidi.Pitch | easymidi.Note;
export type MidiMessageType = 'noteon' | 'noteoff' | 'cc' | 'clock';

let clocks = [];
let currentTime = (new Date().getTime());
export const listenToAllMidiEvents = (midiInput: easymidi.Input) => {
    inputEventTypes.forEach(type => {
        midiInput.on(type as any, msg => {
            if (isSpammyMidiEvent(type, msg as unknown as MidiMessage)) {
                return;
            }

            // if (['noteon', 'noteoff'].includes(type) && msg.channel === 0) {
            //     return;
            // }

            if (type !== 'clock') {
                console.log(msg);
                return;
            }

            if (type === 'clock') {
                const base = 1679023437240;
                const display = new Date().getTime() - base;

                const now = (new Date().getTime());
                const seconds = now - currentTime;
                clocks.push(now)
                if (clocks.length === 96) {
                // }
                // if (seconds > 100) {
                    console.log(clocks.length);
                    currentTime = now;
                    clocks = [];
                }
            }
        });
    });
}

const inputEventTypes = INPUT_TYPES.concat(INPUT_EXTENDED_TYPES);
const isSpammyMidiEvent = (type: string, msg: MidiMessage): boolean => {
    if (Object.values(SPAMMY_MIDI_EVENT_TYPES).includes(type)) {
        return true;
    }

    if (type === 'cc') {
        const controlMessage = msg as easymidi.ControlChange;
        if (controlMessage.controller === 22) {
            return true;
        }
    }

    return false;
}
