import React from 'react';
// import {useStore, State} from 'easy-peasy';

import {Chord, Progression, Scale} from './model-interfaces';
// import {IGlobalStore} from '../../store/store-types';

import './progression_view.scss';

import ChordComponent from './chord';

// const getGroupsOfChords = (chords: Chord[]) => {
//     const copy = [...chords];
//     const result = [];

//     while (copy.length) {
//         result.push(copy.splice(0, 4));
//     }
//     return result;
// };

export default function ProgressionView() {
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

// if (props.globalState && props.globalState.progression) {
//     const {progression: {currentChord, currentProgression, currentSong}, userData: {chords, songs}} = props.globalState;
//     const prog = songs[currentSong][currentProgression];
//     const chord = [currentChord];
//     const getChordName = (chord: number[]) => Object.keys(chords).find((chordName) => arraysAreEqual(chords[chordName], chord));
//     const getColor = (i: number) => {
//         if (i === currentChord) {
//             return 'blue';
//         }

//         if ((currentChord + prog.length - 1) % prog.length === i) {
//             return 'green';
//         }

//         return 'white';
//     };

//     content = (
//         <div>
//             <h1>
//                 {getChordName(chord)}
//             </h1>
//             <ul>
//                 {prog.map((nums, i) => (
//                     <li key={i}>
//                         <span
//                             style={{
//                                 backgroundColor: getColor(i),
//                             }}
//                         >
//                             {getChordName(nums)}
//                         </span>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
