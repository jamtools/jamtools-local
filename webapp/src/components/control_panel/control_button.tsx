import React, {CSSProperties} from 'react';

import {ControlPanelActions} from '@shared/actions/control_panel_actions';
import {GlobalState} from '@shared/state/global_state';

export type Props = {
    action: ControlPanelActions;
    color: string;
    state: GlobalState | null;
    submitControlPanelAction: (action: ControlPanelActions) => void;
}

const isDrumColorAction = (action: string) => action === ControlPanelActions.TOGGLE_DRUM_COLOR_ACTION;
const isDrumMusicAction = (action: string) => action === ControlPanelActions.TOGGLE_DRUM_MUSIC_ACTION;

export default function ControlButton(props: Props) {
    const onClick = async () => {
        props.submitControlPanelAction(props.action);
    };

    const style: CSSProperties = {backgroundColor: props.color};

    if (isDrumColorAction(props.action) && props.state?.progression?.shouldDrumsChangeColor) {
        style.backgroundColor = 'green';
    }

    if (isDrumMusicAction(props.action) && props.state?.progression?.shouldDrumsChangeProgression) {
        // style.backgroundColor = 'green';
    }

    return (
        <button
            onClick={onClick}
            style={style}
        >
            {props.action}
        </button>
    );
}
