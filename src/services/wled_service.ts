import {WLEDClient} from 'wled-client';
import {Config} from '../types/config_types';
import {setRandomColor, setRandomEffect} from '../wled';

export default class WledService {
    private wledClients: WLEDClient[] = [];

    constructor(private config: Config) {
        this.initWledClients();
    }

    setRandomColor = () => {
        this.wledClients.forEach(wled => {
            setRandomColor(wled)
        });
    }

    setRandomEffect = () => {
        this.wledClients.forEach(wled => {
            setRandomEffect(wled);
        });
    }

    setPreset = (preset: number) => {
        this.wledClients.forEach(wled => {
            wled.setPreset(preset);
        });
    }

    private initWledClients = () => {
        this.config.wled.ctrl.forEach(async address => {
            try {
                const ip = address.ip;
                const client = new WLEDClient(ip);
                await client.init();
                this.wledClients.push(client);
            } catch (e) {
                console.error(e);
            }
        });
    }
}
