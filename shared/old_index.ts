import easymidi from 'easymidi';
import {WLEDClient} from 'wled-client';

const debounce = require('debounce');

import {MidiInstrumentName} from './constants/midi_instrument_constants';

// import config from '../data/config.json';

import {listenToAllMidiEvents, sendNoteToPiano} from './midi';
import {setRandomColor, setRandomEffect} from './wled';
// import App from './app';

let wled: WLEDClient | undefined = undefined;

export const oldMain = () => {
    getInputsMain();

    // const input = new easymidi.Input(MidiInstrumentName.GRAND_PIANO);
    // // const input = new easymidi.Input(MidiInstrumentName.DTX_DRUMS);
    // const input = new easymidi.Input(MidiInstrumentName.IAC_DRIVER_BUS_1);
    // const input = new easymidi.Input(MidiInstrumentName.YAMAHA_PIANO);
    const input = new easymidi.Input(MidiInstrumentName.LAUNCHKEY_MINI);
    // listenToAllMidiEvents(input);

    // wledMain();

    // nanoKeyStudioMain();

    // microKeyMain();
    // launchkeyMain();
    // junoMain();
    // spdMain();

    // iacMain();
};

type MidiOut = easymidi.Output;
const outputs: Partial<Record<MidiInstrumentName, MidiOut>> = {};

const wledMain = async () => {
    // const wledAddress = config.wled.ctrls[0].ip;
    // wled = new WLEDClient(wledAddress);
    // await wled.init();

    // console.log(wled.palettes);

    // const s = require('../wled_states/fun color twinkles.json');
    // const {index} = require('../wled_states/index.json');
    // const newIndex = index + 1;

    // fs.writeFileSync('./wled_states/' + newIndex + '.json', JSON.stringify(wled.state));
    // fs.writeFileSync('./wled_states/index.json', JSON.stringify({index: newIndex}));
    // wled.updateState(s as any);
    // const currentIndex =
}

const getInputsMain = () => {
    const inputs = easymidi.getInputs();
    console.log(inputs);
};

const iacMain = () => {
    // app.assignKeyboardOutput(MidiInstrumentName.IAC_DRIVER_BUS_1);
};

const nanoKeyStudioMain = () => {
    const input = new easymidi.Input(MidiInstrumentName.KORG_NANO_KEY_STUDIO);
    // listenToAllMidiEvents(input);

    // input.on('noteon', (msg: MidiEvent) => {
    //     if (msg.velocity === 0) {
    //         return;
    //     }

    //     // setRandomColor(wled);

    //     // setRandomColor(wled).catch(console.error);

    //     if (msg.channel === 4) {
    //         if (msg.note === 60) {
    //             setRandomColor(wled);
    //         }
    //         // return;
    //     }

    //     const juno = outputs[MidiInstrumentName.JUNO];
    //     if (juno) {
    //         juno.send('noteon', {
    //             note: msg.note,
    //             velocity: msg.velocity,
    //             channel: 3,
    //         });
    //     }
    // });

    // input.on('noteoff', (msg: MidiEvent) => {
    //     const juno = outputs[MidiInstrumentName.JUNO];
    //     if (juno) {
    //         juno.send('noteoff', {
    //             note: msg.note,
    //             velocity: msg.velocity,
    //             channel: 3,
    //         });
    //     }
    // });

    const funcs = {
        '25': async (wled: WLEDClient, value: number) => {
            console.log('Changing effect');
            return setRandomEffect(wled);
        },
        '26': async (wled: WLEDClient, value: number) => {
            const actualValue = value * 2;
            console.log('Changing speed', actualValue);
            wled.setEffectSpeed(actualValue, {segmentId: [0, 1]});
        },
        '27': async (wled: WLEDClient, value: number) => {
            const actualValue = value * 2;
            console.log('Changing intensity', actualValue);
            return wled.setEffectIntensity(value * 2, {segmentId: [0, 1]});
        },
        // set brightness
    }

    // input.on('cc', msg => {
    input.on('cc', debounce(async msg => {
        const func = funcs[msg.controller.toString()];
        // console.log(msg)
        if (!func) {
            return;
        }

        await func(wled, msg.value);
    }, 300));
};

const microKeyMain = () => {
    const input = new easymidi.Input(MidiInstrumentName.KORG_MICRO_KEY);
    listenToAllMidiEvents(input);

    input.on('noteon', (msg) => {
        if (msg.velocity === 0) {
            return;
        }

        setRandomColor(wled).catch(console.error);
    });
};

const launchkeyMain = () => {
    const input = new easymidi.Input(MidiInstrumentName.LAUNCHKEY_MINI);
    // listenToAllMidiEvents(input);
    return;

    input.on('noteon', (msg) => {
        if (msg.velocity === 0) {
            return;
        }

        setRandomColor(wled).catch(console.error);
    });

    const funcs = {
        '23': (wled: WLEDClient, value: number) => {
            const speed = value * 2;
            console.log('Changing speed', speed);
            return wled.setEffectSpeed(speed);
        },
        '24': (wled: WLEDClient, value: number) => {
            return wled.setEffectIntensity(value * 2);
        },
    }

    // input.on('cc', msg => {
    input.on('cc', debounce(async msg => {
        const func = funcs[msg.controller.toString()];
        // console.log(msg)
        if (!func || !wled) {
            return;
        }

        await func(wled, msg.value);
    }, 300));
}

const junoMain = () => {
    outputs[MidiInstrumentName.JUNO] = new easymidi.Output(MidiInstrumentName.JUNO);

    const input = new easymidi.Input(MidiInstrumentName.JUNO);
    listenToAllMidiEvents(input);
    // input.on('noteon', (msg) => {
    //     if (msg.velocity === 0) {
    //         return;
    //     }

    //     setRandomColor(wled).catch(console.error);
    // });
};

const spdMain = () => {
    const input = new easymidi.Input(MidiInstrumentName.SPD_SX);
    listenToAllMidiEvents(input);
    return;

    input.on('noteon', (msg) => {
        if (msg.velocity === 0) {
            return;
        }

        // sendNoteToPiano();

        setRandomColor(wled).catch(console.error);
    });
}
