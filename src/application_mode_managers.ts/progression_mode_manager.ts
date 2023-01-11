import easymidi from 'easymidi';
import {WLEDClient} from 'wled-client';

import {ModeManager} from '../types/mode_manager_types';
import {ControlButtonMapping} from '../types/trigger_types';

export default class ProgressionModeManager implements ModeManager {
    private wled: WLEDClient | undefined;

    constructor(wled: WLEDClient | undefined) {
        this.wled = wled;
    }

    handleControlTrigger = (index: number) => {
        if (index === 4) {
            console.log('changing lights');
        }
    }

    handleKeyboardNoteOn = (msg: easymidi.Note, output: easymidi.Output) => {
        // console.log('sending noteon to ' + output.name);
        output.send('noteon', msg);
    }

    handleKeyboardNoteOff = (msg: easymidi.Note, output: easymidi.Output) => {
        // console.log('sending noteoff to ' + output.name);
        output.send('noteoff', msg);
    }
}
