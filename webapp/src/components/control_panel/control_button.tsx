import React, {CSSProperties} from 'react';

import {ControlPanelActions} from '@shared/actions/control_panel_actions';
import {useGlobalState} from 'src/hooks/use_global_state';

export type Props = {
    action: ControlPanelActions;
    color: string;
    submitControlPanelAction: (action: ControlPanelActions) => void;
}

const isDrumColorAction = (action: string) => action === ControlPanelActions.TOGGLE_DRUM_COLOR_ACTION;
const isDrumMusicAction = (action: string) => action === ControlPanelActions.TOGGLE_DRUM_MUSIC_ACTION;

export default function ControlButton(props: Props) {
    const {globalState} = useGlobalState();

    const onClick = async () => {
        props.submitControlPanelAction(props.action);
    };

    const style: CSSProperties = {backgroundColor: props.color};

    if (isDrumColorAction(props.action) && globalState?.progression?.shouldDrumsChangeColor) {
        style.backgroundColor = 'green';
    }

    if (isDrumMusicAction(props.action) && globalState?.progression?.shouldDrumsChangeProgression) {
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
