import easymidi from 'easymidi';

import config from '../data/config.json';
import App from './app';
// import main from './drum_trigger_test/drum_trigger_test';
import {oldMain} from './old_index';
import {Config} from './types/config_types/config_types';

// main();

const app = new App(easymidi, process.stdin, config);

oldMain();

console.log('running');
