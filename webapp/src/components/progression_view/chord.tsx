import React from 'react';
import classnames from 'classnames';

import {Chord} from './model-interfaces';

// import DumbPiano from '../piano/dumb-piano';

import ChordName from './chord-name';

type Props = {
    chord: Chord;
}

export default function ChordComponent(props: Props) {
    const {chord} = props;

    // const selected = Math.random() > 0.5
    // const selectedClass = selected ? styles.selectedChord : ''

    const selectedClass = '';

    return (
        <div className={classnames('entireChordContainer', selectedClass)}>
            {/* <DumbPiano
        height='100px'
        playNote={() => console.log('special')}
        // noteRange={{ first: firstNote, last: lastNote }}
        width={200}
        // keyboardShortcuts={keyboardShortcuts}
        heldDownNotes={chord.notes}
      /> */}
            <ChordName chord={chord}/>
        </div>
    );
}
