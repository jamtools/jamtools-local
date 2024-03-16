import {Subscription} from 'rxjs';

import {log} from '../../utils';

import QwertyService from './qwerty_service';

const thumbstickLeft = 'x';
const thumbstickRight = 'w';

const mainTrigger = 'h';
const secondaryTrigger = 'u';

export type Action = {
    name: string;
    func: () => void;
}

export default class BluetoothRemoteDynamicMapping {
    private currentMainIndex = 0;
    private qwertyServiceSubject: Subscription;

    constructor(private main: Action[], private secondary: Action, private qwertyService: QwertyService) {
        this.qwertyServiceSubject = this.qwertyService.subscribe((key: string) => {
            this.handleKeyPress(key);
        });
    }

    private handleKeyPress = (key: string) => {
        if (key === mainTrigger) {
            const action = this.main[this.currentMainIndex];
            log('Running main action ' + action.name);
            action.func();
            return;
        }

        if (key === secondaryTrigger) {
            const action = this.secondary;
            log('Running secondary action ' + action.name);
            action.func();
            return;
        }

        if (key === thumbstickLeft) {
            const offset = this.main.length - 1;
            const newIndex = (this.currentMainIndex + offset) % this.main.length;
            this.currentMainIndex = newIndex;
            log('Setting main action index to ' + newIndex);
            return;
        }

        if (key === thumbstickRight) {
            const offset = 1;
            const newIndex = (this.currentMainIndex + offset) % this.main.length;
            log('Setting main action index to ' + newIndex);
            this.currentMainIndex = newIndex;
        }
    };

    close = () => {
        this.qwertyServiceSubject.unsubscribe();
    };
}
