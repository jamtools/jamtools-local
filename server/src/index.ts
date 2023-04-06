import easymidi from 'easymidi';

import config from '../../data/config.json';
import App from '@shared/app';
// import main from './drum_trigger_test/drum_trigger_test';
import {oldMain} from '../../shared/old_index';

import {Config} from '@shared/types/config_types/config_types';
import {UserDataState} from '@shared/state/user_data_state';
const conf: Config = config;

import initServer from './server';
import {CHORDS} from '@shared/constants/chord_constants';
import {jimmySet1, jimmySet2, michaelSet1} from '@shared/constants/progression_constants';
import {exitHandler} from './exit_handler';

const songs: number[][][][] = [
    // set1,
    // set2,
    jimmySet1,
    jimmySet2,
    michaelSet1,
]

const userData: UserDataState = {
    chords: CHORDS,
    songs,
};

// main();

const app = new App(easymidi, process.stdin, config, userData);

(async () => {
    exitHandler(app);

    const server = await initServer(app);
    server.listen(1337);

    oldMain();

    console.log('running');
})();
