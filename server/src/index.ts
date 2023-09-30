import easymidi from 'easymidi';

import App from '@shared/app';

import {Config} from '@shared/types/config_types/config_types';
import {UserDataState} from '@shared/state/user_data_state';

import {CHORDS} from '@shared/constants/chord_constants';
import {jimmySet1, jimmySet2, michaelSet1} from '@shared/constants/progression_constants';

import {EasyMidi} from '@shared/types/easy_midi_types';

import config from '../../data/config.json';

import {oldMain} from '../../shared/old_index';

import initServer from './server';
import {exitHandler} from './exit_handler';

const conf: Config = config;

const songs: number[][][][] = [
    // set1,
    // set2,
    jimmySet1,
    jimmySet2,
    michaelSet1,
];

const userData: UserDataState = {
    chords: CHORDS,
    songs,
};

// main();

const fullEasyMidi: EasyMidi = {
    getInputs: easymidi.getInputs,
    getOutputs: easymidi.getOutputs,
    createInput: (name: string, virtual?: boolean) => new easymidi.Input(name, virtual),
    createOutput: (name: string, virtual?: boolean) => new easymidi.Output(name, virtual),
};

const app = new App(fullEasyMidi, process.stdin, conf, userData);

(async () => {
    exitHandler(app);

    const server = await initServer(app);
    server.listen(1337);

    oldMain();

    console.log('running');
})();
