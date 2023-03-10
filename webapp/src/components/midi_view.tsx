import React, {useState, useRef, useEffect} from 'react';

import * as webmidi from 'webmidi';
const WebMidi = webmidi.WebMidi;

import {WLEDClient as WLEDClient2} from 'wled-client';
import {setRandomColor} from '../wled';

const WLEDClient = WLEDClient2.WLEDClient as unknown as WLEDClient2;

export default function MidiView() {
    const midiInput = useRef<webmidi.Input | null>(null);
    const [heldDown, setHeldDown] = useState<webmidi.Note[]>([]);

    const savedChords = useState<webmidi.Note[][]>([]);
    const [chordName, setChordName] = useState('');

    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            await WebMidi.enable();
            // setError(WebMidi.inputs);
            console.log(WebMidi.inputs);
            const input = WebMidi.inputs[2];
            // const input = WebMidi.inputs.find(i => i.name.includes('Juno'));
            if (!input) {
                setError('Cant find juno midi input');
                return;
            }
            midiInput.current = input;
            initializeJuno(input);
            // console.log(webmidi)
        })();
    }, []);

    const initializeJuno = (juno: webmidi.Input) => {
        console.log('init juno')
        juno.addListener('noteon', (msg) => {
            if (msg.message.channel === 2) {
                return;
            }

            setHeldDown(heldDown => {
                console.log('note on ' + msg.note);

                const newHeldDown = heldDown.concat([msg.note]);
                return newHeldDown;
            })
        });

        juno.addListener('noteoff', (msg) => {
            if (msg.message.channel === 2) {
                return;
            }

            return;

            setHeldDown((heldDown) => {
                console.log('note off ' + msg.note);

                const index = heldDown.findIndex(note => note.number === msg.note.number);
                if (index === -1) {
                    console.log('couldnt find held down note for "noteff" event');
                    return heldDown;
                }

                const newHeldDown = heldDown.slice(0, index).concat(heldDown.slice(index + 1));
                return newHeldDown;
            });
        });
    };

    const saveChord = () => {
        // const newChord = {
        //     name: chordName,
        //     notes: heldDown.map(n => ({
        //         name: n.name + n.octave,
        //         number: n.number,
        //     })),
        // };

        const newChord = heldDown.map(n => n.number);
        const s = JSON.stringify(newChord, null, 2);
        setError(s);

        setHeldDown([]);
    };

    return (
        <div>
            <pre>
                {error}
            </pre>
            <div>
                <button onClick={saveChord}>
                    Save Chord
                </button>
            </div>
            <input value={chordName} onChange={(e) => {
                setChordName(e.target.value);
            }} />
            <pre>
                <ul>
                    {heldDown.map((n, i) => (
                        <li key={i}>
                            {n.name}{n.accidental} {n.number}
                        </li>
                    ))}
                </ul>
            </pre>
            {/* <button onClick={changeColor}>
                Change color
            </button> */}
        </div>
    )
}
