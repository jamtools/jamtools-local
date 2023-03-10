import React, {CSSProperties, useEffect, useState} from 'react';

import {ControlPanelActions, SerializedAction} from '../../../shared/control_panel_actions';

export type Props = {
    action: ControlPanelActions;
    color: string;
}

type ImportMeta = {
    env: {
        API_HOST?: string;
    }
}

let apiHost = (import.meta as unknown as ImportMeta).env.API_HOST;
const host = apiHost || 'http://jam.local:1337';

const submitAction = (actionName: ControlPanelActions) => {
    const action: SerializedAction = {
        action: actionName,
    };

    return fetch(host + '/action', {
        body: JSON.stringify(action),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

const isDrumColorAction = (action: string) => action === ControlPanelActions.TOGGLE_DRUM_COLOR_ACTION;
const isDrumMusicAction = (action: string) => action === ControlPanelActions.TOGGLE_DRUM_MUSIC_ACTION;

export default function ControlButton(props: Props) {
    const [drumColorEnabled, setDrumColorEnabled] = useState(true);
    const [drumMusicEnabled, setDrumMusicEnabled] = useState(true);

    useEffect(() => {
        if (!isDrumColorAction(props.action) && !isDrumMusicAction(props.action)) {
            return;
        }

        fetch(host + '/drum_trigger_state', {
            method: 'GET',
        }).then(r => r.json()).then(({color, music}) => {
            setDrumColorEnabled(color);
            setDrumMusicEnabled(music);
        });
    }, []);

    const onClick = () => {
        submitAction(props.action).catch(console.error);
        if (isDrumColorAction(props.action)) {
            setDrumColorEnabled(!drumColorEnabled);
        }
        if (isDrumMusicAction(props.action)) {
            setDrumMusicEnabled(!drumMusicEnabled);
        }
    };

    const style: CSSProperties = {backgroundColor: props.color};

    if (isDrumColorAction(props.action) && drumColorEnabled) {
        style.backgroundColor = 'green';
    }

    if (isDrumMusicAction(props.action) && drumMusicEnabled) {
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
