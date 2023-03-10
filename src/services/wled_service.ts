import {WLEDClient, WLEDClientPreset} from 'wled-client';
import {Config} from '../types/config_types/config_types';
import {log} from '../utils';
import {setRandomColor, setRandomEffect} from '../wled';

let speed = 50;

export default class WledService {
    private wledClients: WLEDClient[] = [];

    constructor(private config: Config) {
        this.initWledClients();
    }

    setRandomColor = () => {
        // log('fake setting random color');
        // return;
        this.wledClients.forEach(wled => {
            setRandomColor(wled)
        });
    }

    setRandomEffect = () => {
        // log('fake setting random effect');
        // return;
        this.wledClients.forEach(wled => {
            setRandomEffect(wled);
        });
    }

    setPreset = (preset: number) => {
        // log('fake setting preset ' + preset);
        // return;
        this.wledClients.forEach(wled => {
            wled.setPreset(preset);
        });
    }

    presets: string[] = [];
    currentPresentIndex = 1;
    setRandomPreset = () => {
        const client = this.getClient();
        if (!client) {
            return;
        }

        let rand = Math.floor(Math.random() * this.presets.length);
        if (rand === this.currentPresentIndex) {
            rand = (rand + 1) % this.presets.length;
        }

        this.currentPresentIndex = rand;
        this.setPreset(rand);
    }

    savePreset = async () => {
        const client = this.getClient();
        if (!client) {
            return;
        }

        const names = Object.values(client.presets).map(p => p.name);
        for (let i = 0; i < 60; i++) {
            const name = i.toString();

            if (names.includes(name)) {
                continue;
            }

            const id = names.length;

            try {
                await client.saveStateAsPreset(id, {
                    name,
                    includeBrightness: false,
                    segmentBounds: true,
                });
            } catch (e) {
                console.error(e);
            }

            break;
        }
        // console.log(newName);
        // client.saveStateAsPreset(presetName)
    }

    increaseSpeed = () => {
        // TODO: debounce changes
        const client = this.getClient();
        if (!client) {
            return;
        }

        // const speed = client.getSegment(0).effectSpeed!;
        const newSpeed = Math.min(speed + 10, 255);
        speed = newSpeed;
        client.setEffectSpeed(newSpeed);

        log('increasing speed to ' + newSpeed);
    }

    decreaseSpeed = () => {
        const client = this.getClient();
        if (!client) {
            return;
        }

        // const speed = client.getSegment(0).effectSpeed!;
        const newSpeed = Math.max(speed - 10, 0);
        speed = newSpeed;
        client.setEffectSpeed(newSpeed);
        log('decreasing speed to ' + newSpeed);
    }

    private getClient = (): WLEDClient | undefined => {
        return this.wledClients[0];
    }

    private initWledClients = () => {
        log('initializing wled clients');
        this.config.wled.ctrls.forEach(async address => {
            try {
                const ip = address.ip;
                const client = new WLEDClient(ip);
                await client.init();
                this.wledClients.push(client);
                this.presets = Object.keys(client.presets);
            } catch (e) {
                console.error(e);
            }
        });
    }
}
