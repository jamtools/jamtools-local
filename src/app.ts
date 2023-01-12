import process from 'node:process';

import easymidi from 'easymidi';
import ProgressionModeManager from './application_mode_managers.ts/progression_mode_manager';

import {MidiInstrumentName} from './constants/midi_instrument_constants';
import MidiService from './services/midi_service';
import WledService from './services/wled_service';
import {Config} from './types/config_types';
import {EasyMidi} from './types/easy_midi_types';
import {MidiInputMapper, ControlButtonMapping, KeyboardMapping, MidiTriggerMappings, MidiOutputMapper} from './types/trigger_types';

export default class App {
    private midiInputs: MidiInputMapper = {} as MidiInputMapper;
    private midiOutputs: easymidi.Output[] = [];

    private progressionMode: ProgressionModeManager;
    private midiService: MidiService;
    private wledService: WledService;

    constructor(private midi: EasyMidi, private config: Config) {
        this.midiService = new MidiService(midi, config);
        this.wledService = new WledService(config);

        this.progressionMode = new ProgressionModeManager(this.midiService, this.wledService, config);

        this.setExitHandler();
    }

    setExitHandler = () => {
        process.stdin.resume();//so the program will not close instantly

        const exitHandler = (options, exitCode) => {
            if (options.cleanup) {
                this.progressionMode.close();
                this.midiService.close();
            }
            if (options.exit) {
                process.exit();
            }
        }

        // always runs after other handlers
        process.on('exit', exitHandler.bind(null, {cleanup: true}));

        // catches ctrl+c event
        process.on('SIGINT', exitHandler.bind(null, {exit: true}));

        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
        process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));

        process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
    }
}
