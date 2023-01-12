import easymidi from 'easymidi';

import config from '../data/config.json';
import App from './app';
import {oldMain} from './old_index';

const app = new App(easymidi, config);

oldMain();
