import React, {useEffect, useState} from 'react';
import {ControlPanelActions} from '@shared/actions/control_panel_actions';
import ControlButton from './control_button';

import {CHORDS} from '@shared/constants/chord_constants';

import {submitControlPanelAction} from '../../actions/remote_actions';

import './control_panel.scss';
import {fetchGlobalState} from '../../actions/remote_actions';
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

export type Props = {
    globalState: GlobalState | null;
    setGlobalState: (state: GlobalState) => void;
}

export default function ControlPanel(props: Props) {
    const submitAction = (action: ControlPanelActions) => {
        submitControlPanelAction(action).then(res => {
            if (isErrorResponse(res)) {
                alert(res.error);
                return;
            }

            // props.setGlobalState(res.data);
        });
    }

    const makeButton = (action: ControlPanelActions) => (
        <ControlButton
            action={action}
            color={getColor(action)}
            state={props.globalState}
            submitControlPanelAction={submitAction}
        />
    );

    return (
        <div>
            I know {Object.keys(CHORDS).length} Chords!
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
