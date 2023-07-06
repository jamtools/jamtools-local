import App from 'app';
import type {Stdin} from 'services/qwerty_service';
import {UserDataState} from 'state/user_data_state';
import {Config} from 'types/config_types/config_types';
import {EasyMidi} from 'types/easy_midi_types';

import {MidiMock} from './mocks/midi_mock';

describe('app', () => {
    let midi: EasyMidi;
    let stdin: Stdin;
    let config: Config;
    let userData: UserDataState;

    beforeEach(() => {
        midi = new MidiMock();
        stdin = {} as unknown as Stdin;
        config = {
            actions: {

            },
            midi: {
                inputs: [],
                outputs: [],
            },
            wled: {
                ctrls: [],
            },
        };
        userData = {
            chords: {},
            songs: [],
        };
    });

    test('doit', () => {
        const _app = new App(midi, stdin, config, userData);
    });
});
