import {useEffect, useRef, useState} from 'react';

import * as webmidi from 'webmidi';
const WebMidi = webmidi.WebMidi;

type UseMidiResponse = typeof WebMidi | undefined;

export const useWebMidi = (): UseMidiResponse => {
    const [webMidi, setWebMidi] = useState<UseMidiResponse>(undefined);

    const midiInput = useRef<webmidi.Input | null>(null);

    useEffect(() => {
        (async () => {
            await WebMidi.enable();

            // setError(WebMidi.inputs);
            console.log(WebMidi.inputs);
            const input = WebMidi.inputs[0];
            if (!input) {
                alert('Cant find midi input');
                return;
            }
            midiInput.current = input;

            // initializeJuno(input);
            setWebMidi(WebMidi);

            // console.log(webmidi)
        })();
    }, []);

    return webMidi;
};
