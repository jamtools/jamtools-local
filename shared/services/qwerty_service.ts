import {ReplaySubject, Subject} from 'rxjs';

import {Config} from '../types/config_types/config_types';

export type Stdin = Pick<
    typeof process.stdin,
    'resume' | 'setEncoding' | 'on'
> & {setRawMode?: typeof process.stdin.setRawMode};


export default class QwertyService {
    private subject: Subject<string> = new ReplaySubject();

    constructor(private stdin: Stdin, private config: Config) {
        // const v = new GlobalKeyboardListener();

        // v.addListener((e, down) => {
        //     // console.log(
        //     //     `${e.name} ${e.state == "DOWN" ? "DOWN" : "UP  "} [${e.rawKey._nameRaw}]`
        //     // );
        //     if (e.state === 'DOWN' && e.name) {
        //         this.subject.next(e.name.toLowerCase());
        //     }
        // });

        stdin.setRawMode?.(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        stdin.on('data', (key) => {
            if (key.toString() === '\u0003') {
                process.exit();
            }

            this.subject.next(key.toString());
        });
    }

    subscribe = (callback: (subjectMessage) => void) => {
        return this.subject.subscribe(callback);
    }

    close = () => {}
}
