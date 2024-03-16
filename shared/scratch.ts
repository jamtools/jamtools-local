import {INPUT_TYPES, INPUT_EXTENDED_TYPES} from './constants/easymidi_constants';

const easymidi = require('easymidi');

const midiInputName = 'Juno USB Midi';
const input = new easymidi.Input(midiInputName);

// input.on('noteon', console.log);

INPUT_TYPES.concat(INPUT_EXTENDED_TYPES).forEach((type) => {
    input.on(type, (msg) => {
        if (['noteon', 'noteoff'].includes(type) && msg.channel === 0) {
            return;
        }

        console.log(msg);
    });
});
