import {INPUT_EXTENDED_TYPES, INPUT_TYPES, SPAMMY_MIDI_EVENT_TYPES} from './constants/easymidi_constants';

export const sendNoteToPiano = (output) => {
    output.send('noteoff', {
        note: 64,
        velocity: 40,
        channel: 3,
    });
}

export const listenToAllMidiEvents = (midiInput) => {
    INPUT_TYPES.concat(INPUT_EXTENDED_TYPES).forEach(type => {
        midiInput.on(type, msg => {
            if (Object.values(SPAMMY_MIDI_EVENT_TYPES).includes(type)) {
                return;
            }

            // if (['noteon', 'noteoff'].includes(type) && msg.channel === 0) {
            //     return;
            // }

            console.log(msg);
        });
    });
}
