type MidiEvent = {
    note?: {
        number: number;
    };
    velocity?: number;
    target?: {
        number: number;
    };
}

type MidiDevice = {
    name: string;
    addListener: (eventType: string,
        callback: (event: MidiEvent) => void
    ) => void;
    send: (rawMessage: [number, number, number]) => void;
}

type Note = {
    note: number;
    channel: number;
    velocity: number;
}

type WebMidiType = {
    enable: () => void;
    inputs: MidiDevice[];
    outputs: MidiDevice[];
}

import * as webmidi from 'webmidi';
const WebMidi = webmidi.WebMidi as WebMidiType;

import {CHORDS} from '@shared/constants/chord_constants';

import {jimmySet1, jimmySet2, michaelSet1} from '@shared/constants/progression_constants';

import type {EasyMidi} from '@shared/types/easy_midi_types';

import {MidiMessageType} from '@shared/midi';

import {ControlPanelActions, getActionMap} from '@shared/actions/control_panel_actions';
import {SubmitControlPanelActionAPIResponse, GetStateAPIResponse} from '@shared/types/api_types';

import App from '@shared/app';

import {GlobalState} from '@shared/state/global_state';
import {Stdin} from '@shared/services/qwerty_service';
import {Config} from '@shared/types/config_types/config_types';
import {UserDataState} from '@shared/state/user_data_state';

import config from '../../../data/config.json';

import type {WebsocketMessage} from '../websocket/websocket_client';

import type {ActionHandler} from './app_actions';

const conf: Config = config;

class EasyMidiWebShim implements EasyMidi {
    constructor(private webMidi: typeof WebMidi) { }

    enable = () => this.webMidi.enable();

    getInputs: () => string[] = () => {
        console.log(this.webMidi);
        return this.webMidi.inputs.map((i) => i.name);
    };

    getOutputs: () => string[] = () => {
        return this.webMidi.outputs.map((i) => i.name);
    };

    getInputConstructor = () => {
        const webMidi = this.webMidi;
        return class Input {
            input: MidiDevice;
            constructor(private name: string) {
                this.input = webMidi.inputs.find((i) => i.name === name)!;
            }

            on = (eventName: string, callback: (note: Note) => void) => {
                if (!this.input) {
                    this.input = webMidi.inputs.find((device) => device.name === this.name)!;
                }

                return this.input.addListener(eventName, (event) => {
                    const noteNumber = event.note?.number || 0;
                    const channel = (event.target?.number ?? 1) - 1;
                    const velocity = Math.ceil((event.velocity ?? 1) * 127);

                    if (noteNumber > 100) {
                        return;
                    }
                    callback({
                        note: noteNumber,
                        channel,
                        velocity,
                    });
                });
            };
        };
    };

    getOutputConstructor = () => {
        const webMidi = this.webMidi;
        return class Output {
            output = webMidi.outputs.find((i) => i.name === this.name);
            constructor(private name: string) {

            }

            messageTypeMap: Record<string, number> = {
                noteon: 0x90,
                noteoff: 0x80,
            };

            send = (type: MidiMessageType, msg: {
                note: number;
                velocity: number;
                channel: number;
            }) => {
                if (!(type in this.messageTypeMap)) {
                    return;
                }

                if (!this.output) {
                    return;
                }

                const first = 0x90 + msg.channel;

                const second: number = msg.note;
                const midiMessage: [number, number, number] = [first, second, msg.velocity];
                this.output.send(midiMessage);

                // for (let i = 0; i < 4; i++) {
                //     second = msg.note + i * 12;
                //     midiMessage = [first, second, msg.velocity];
                //     this.output.send(midiMessage);

                //     second = msg.note + i * 12 + 4;
                //     midiMessage = [first, second, msg.velocity];
                //     this.output.send(midiMessage);

                //     second = msg.note + i * 12 + 7;
                //     midiMessage = [first, second, msg.velocity];
                //     this.output.send(midiMessage);
                // }
            };

            // output.send(type as any, msg as any);
        };
    };

    Input = this.getInputConstructor();
    Output = this.getOutputConstructor();
}

export class LocalActionHandler implements ActionHandler {
    app: App;

    constructor() {
        const stdin = {
            on: (..._) => {

            },
            resume: () => {

            },
            setEncoding: (..._) => {

            },
        } as Stdin;

        const midiShim = new EasyMidiWebShim(WebMidi);

        // try {
        this.app = new App(midiShim, stdin, conf, userData);

        // } catch (e) {
        // alert(e)
        // }
    }

    subscribeToMessages = (callback: (msg: WebsocketMessage<unknown>) => void) => {
        this.subscribeToGlobalState((state) => {
            const msg: WebsocketMessage<unknown> = {
                type: 'update_state',
                data: state,
            };
            callback(msg);
        });
    };

    subscribeToGlobalState = (callback: (state: GlobalState) => void) => {
        return this.app.subscribeToGlobalState(callback);
    };

    submitControlPanelAction = async (action: ControlPanelActions): Promise<SubmitControlPanelActionAPIResponse> => {
        const app = this.app;
        const actions = getActionMap(app);

        const a = action as unknown as keyof typeof actions;
        console.log(actions);

        if (!actions[a]) {
            return {error: 'No action found for ' + action};
        }

        try {
            await Promise.resolve(actions[a]());
        } catch (e: unknown) {
            const e2 = e as Error;
            console.error(`Error running action ${action}: ` + e);
            return {error: e2.message};
        }

        const state = app.getState();
        app.broadcastState();

        return {
            data: state,
        };
    };

    fetchGlobalState = async (): Promise<GetStateAPIResponse> => {
        return {data: this.app.getState()};
    };
}

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
