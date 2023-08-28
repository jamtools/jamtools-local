import React from 'react';
// import {useStore, State} from 'easy-peasy';

import {Chord, Progression, Scale} from './model-interfaces';
// import {IGlobalStore} from '../../store/store-types';

import './progression_view.scss';

import ChordComponent from './chord';

type Props = {

}

// const getGroupsOfChords = (chords: Chord[]) => {
//     const copy = [...chords];
//     const result = [];

//     while (copy.length) {
//         result.push(copy.splice(0, 4));
//     }
//     return result;
// };

export default function ProgressionView(props: Props) {
    // const progressions: Progression[] = useStore((state: State<IGlobalStore>) => state.progressions.progressions);
    // const scale: Scale = useStore((state: State<IGlobalStore>) => state.progressions.currentScale);

    const progressions: Progression[] = [
        {
            chords: [
                {
                    notes: [
                        {
                            name: 'C',
                            number: 48,
                            octave: 4,
                        },
                    ],
                },
                {
                    notes: [
                        {
                            name: 'D',
                            number: 48,
                            octave: 4,
                        },
                    ],
                },
            ],
        },
    ];
    const scale: Scale = {
        root: {
            name: 'C',
            number: 48,
            octave: 4,
        },
        quality: 'Major',
    };

    // const groups = getGroupsOfChords(chords)

    return (
        <React.Fragment>
            {scale && <h1>{scale.root.name} {scale.quality}</h1>}

            {progressions.length === 0 && (
                <h1>No progression</h1>
            )}

            {progressions.map((progression, i) => (
                <div
                    key={i}
                    className={'progressionContainer'}
                >
                    {progression.chords.map((chord: Chord, i: number) => (
                        <ChordComponent
                            chord={chord}
                            key={i}
                        />
                    ))}
                    {/* <h1 className={styles.heading}>
            <pre>
            {JSON.stringify(chords.map(chord => chord.notes[0].name), null, 2)}
            </pre>
          </h1> */}
                </div>
            ))}
        </React.Fragment>
    );
}
