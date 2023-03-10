import easymidi from 'easymidi';

import config from '../data/config.json';
import App from './app';
// import main from './drum_trigger_test/drum_trigger_test';
import {oldMain} from './old_index';
import {Config} from './types/config_types/config_types';

// main();

const app = new App(easymidi, process.stdin, config);

import initServer from './server';
const server = initServer(app);
server.listen(1337);

oldMain();

console.log('running');
