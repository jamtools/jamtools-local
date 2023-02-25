import process from 'node:process';

import ProgressionModeManager from './application_mode_managers.ts/progression_mode_manager';

import MidiService from './services/midi_service';
import QwertyService, {Stdin} from './services/qwerty_service';
import WledService from './services/wled_service';
import {Config} from './types/config_types/config_types';
import {EasyMidi} from './types/easy_midi_types';

export default class App {
    private progressionMode: ProgressionModeManager;
    private midiService: MidiService;
    private wledService: WledService;
    private qwertyService: QwertyService;

    constructor(private midi: EasyMidi, private stdin: Stdin, private config: Config) {
        this.midiService = new MidiService(midi, config);
        this.wledService = new WledService(config);
        this.qwertyService = new QwertyService(stdin, config);

        this.progressionMode = new ProgressionModeManager(this.midiService, this.wledService, this.qwertyService, config);

        this.setExitHandler();
    }

    setExitHandler = () => {
        // so the program will not close instantly
        this.stdin.resume();

        const exitHandler = (options, exitCode) => {
            if (options.cleanup) {
                this.progressionMode.close();
                this.midiService.close();
                this.qwertyService.close();
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

        // process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
    }
}
