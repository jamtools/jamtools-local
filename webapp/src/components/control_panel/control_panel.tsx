import React from 'react';
import {ControlPanelActions} from '@shared/actions/control_panel_actions';

import {isErrorResponse} from '@shared/types/api_types';

import {useGlobalState} from '../../hooks/use_global_state';

import ControlButton from './control_button';

import './control_panel.scss';

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

export type Props = {
    // submitControlPanelAction: (action: ControlPanelActions) => void;
}

// const arraysAreEqual = (arr1: number[], arr2: number[]): boolean => {
//     return arr1.length === arr2.length && arr1.reduce((accum, current, index) => {
//         return accum && current === arr2[index];
//     }, true);
// };

export default function ControlPanel() {
    const {actionHandler} = useGlobalState();

    const submitAction = (action: ControlPanelActions) => {
        actionHandler.submitControlPanelAction(action).then((res) => {
            if (isErrorResponse(res)) {
                alert(res.error);
            }
        });
    };

    const makeButton = (action: ControlPanelActions) => (
        <ControlButton
            action={action}
            color={getColor(action)}
            submitControlPanelAction={submitAction}
        />
    );

    const rows = rowsData.map((row, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={i}>
            {row.map((action) => (
                <td key={action}>
                    {makeButton(action)}
                </td>
            ))}
        </tr>
    ));

    let content: React.ReactNode | undefined;

    return (
        <div>
            {content}
            <table>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    );
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
        // ControlPanelActions.NEXT_CHORD,
        ControlPanelActions.RESET_PROGRESSION,
        ControlPanelActions.LOCK_IN_PROGRESSION,
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
};

const getColor = (actionName: ControlPanelActions): string => {
    return Object.keys(buttonColors).find((c) => buttonColors[c].includes(actionName))!;
};
