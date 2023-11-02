import React from 'react';

import {Note, Chord} from './model-interfaces';

// import {cycle} from '../../midi_processing/chord-processor';

// import styles from './progression_view.scss';

const cycle = (n: number) => n % 12;

const correctNoteName = (note: Note) => {
    return note.name;
};

type Props = {
    chord: Chord;
}

export default function ChordName(props: Props) {
    const {chord} = props;

    let label;
    const name = correctNoteName(chord.notes[0]);
    if (chord.notes.length === 1) {
        label = name;
    } else {
        const isMinor = cycle(chord.notes[0].number + 3) === cycle(chord.notes[1].number);
        label = isMinor ? name + 'm' : name;
    }

    return (
        <div className={'noteNameContainer'}>
            <span className={'chordName'}>
                {label}
            </span>
        </div>
    );
}
