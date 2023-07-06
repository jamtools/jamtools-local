import React from 'react';
import {ControlPanelActions} from '@shared/actions/control_panel_actions';
import ControlButton from './control_button';

import {ActionHandler} from '../../actions/app_actions';

import './control_panel.scss';
import {GlobalState} from '@shared/state/global_state';
import {isErrorResponse} from '@shared/types/api_types';

type RowsData = ControlPanelActions[][];
const rowsData: RowsData = Object.values(ControlPanelActions).reduce((accum: RowsData, actionName, i) => {
    const column = i % 4;
    const row = Math.floor(i / 4);

    if (column === 0) {
        accum.push([]);
    }

    accum[row].push(actionName);

    return accum;
}, []);

type SpecialFunction = (thatThang: string) => void;

export type Props = {
    globalState: GlobalState | null;
    setGlobalState: (state: GlobalState) => void;
    actionHandler: ActionHandler;
}

const arraysAreEqual = (arr1: any[], arr2: any[]): boolean => {
    return arr1.length === arr2.length && arr1.reduce((accum, current, index) => {
        return accum && current === arr2[index];
    }, true);
}

export default function ControlPanel(props: Props) {
    const submitAction = (action: ControlPanelActions) => {
        props.actionHandler.submitControlPanelAction(action).then(res => {
            if (isErrorResponse(res)) {
                alert(res.error);
                return;
            }
        });
    }

    const myFunc: SpecialFunction = (thatThang9hg98uh) => {

    }

    const makeButton = (action: ControlPanelActions) => (
        <ControlButton
            action={action}
            color={getColor(action)}
            state={props.globalState}
            submitControlPanelAction={submitAction}
        />
    );

    let content: React.ReactNode | undefined;
    if (props.globalState && props.globalState.progression) {
        const {progression: {currentChord, currentProgression, currentSong}, userData: {chords, songs}} = props.globalState;
        const prog = songs[currentSong][currentProgression]
        const chord = [currentChord];
        const getChordName = (chord: number[]) => Object.keys(chords).find(chordName => arraysAreEqual(chords[chordName], chord));
        const getColor = (i: number) => {
            if (i === currentChord) {
                return 'blue';
            }

            if ((currentChord + prog.length - 1) % prog.length === i) {
                return 'green';
            }

            return 'white';
        }

        content = (
            <div>
                <h1>
                    {getChordName(chord)}
                </h1>
                <ul>
                    {prog.map((nums, i) => (
                        <li key={i}>
                            <span style={{
                                backgroundColor: getColor(i),
                            }}>
                                {getChordName(nums)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div>
            {content}
            <table>
                <tbody>
                    {rowsData.map((row, i) => (
                        <tr key={i}>
                            {row.map((action) => (
                                <td key={action}>
                                    {makeButton(action)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const Colors = {
    NAVY: '#001f3f',
    BLUE: '#0074D9',
    AQUA: '#0000FF',
    PURPLE: '#B10DC9',
    RED: '#FF4136',
} as const;

const buttonColors: Record<string, ControlPanelActions[]> = {
    [Colors.NAVY]: [
        ControlPanelActions.NEXT_CHORD,
        ControlPanelActions.NEXT_PROGRESSION,
        ControlPanelActions.NEXT_SONG,
    ],
    [Colors.AQUA]: [
        ControlPanelActions.CHANGE_COLOR,
        ControlPanelActions.CHANGE_PRESET,
    ],
    [Colors.PURPLE]: [
        // ControlPanelActions.RAINBOW,
    ],
    [Colors.RED]: [
        ControlPanelActions.SOUND_OFF,
        // ControlPanelActions.LIGHTS_OFF,
    ],
    [Colors.BLUE]: [
        ControlPanelActions.TOGGLE_DRUM_COLOR_ACTION,
        ControlPanelActions.TOGGLE_DRUM_MUSIC_ACTION,
    ],
}

const getColor = (actionName: ControlPanelActions): string => {
    return Object.keys(buttonColors).find(c => buttonColors[c].includes(actionName))!;
}
