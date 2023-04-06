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
        stdin = {} as any;
        config = {
            actions: {

            },
            midi: {

            },
            wled: {
                ctrls:
            }
        };
        userData = {};
    });

    test('doit', () => {
        const app = new App(midi, stdin, config, userData);
    });
});
