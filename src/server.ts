import express from 'express';
import cors from 'cors';

import {ControlPanelActions, SerializedAction} from '../webapp/shared/control_panel_actions';
import type App from './app';

export default function initServer(app: App) {
    const server = express();

    const actions: Record<ControlPanelActions, () => void> = {
        [ControlPanelActions.CHANGE_COLOR]: app.setRandomColor,
        [ControlPanelActions.CHANGE_PRESET]: app.nextPreset,
        [ControlPanelActions.NEXT_CHORD]: app.progressionMode.playChord,
        [ControlPanelActions.NEXT_PROGRESSION]: app.progressionMode.nextProgression,

        [ControlPanelActions.TOGGLE_DRUM_COLOR_ACTION]: app.toggleDrumsColorAction,
        [ControlPanelActions.TOGGLE_DRUM_MUSIC_ACTION]: app.toggleDrumsMusicAction,
        [ControlPanelActions.SOUND_OFF]: app.noteOffAll,
        [ControlPanelActions.NEXT_SONG]: app.progressionMode.nextSong,
        // [ControlPanelActions.LIGHTS_OFF]: app.setRandomColor,
        // [ControlPanelActions.RAINBOW]: app.setRandomColor,
        // [ControlPanelActions.SAVE_PRESET]: app.savePreset,
    };

    server.use(express.json());
    server.use(cors({
        origin: [
            'http://localhost:1234',
            'http://jam.local',
            'http://localhost',
            '*',
        ],
    }));

    server.get<undefined, {color: boolean, music: boolean}>('/drum_trigger_state', (req, res) => {
        const shouldColor = app.progressionMode.shouldDrumsChangeColor;
        const shouldMusic = app.progressionMode.shouldDrumsChangeProgression;
        res.json({color: shouldColor, music: shouldMusic});
    });

    server.post<undefined, {success?: boolean; error?: string}, SerializedAction>('/action', (req, res) => {
        const action = req.body.action;

        if (!actions[action]) {
            res.json({error: 'No action found for ' + action});
            return;
        }

        actions[action]();

        res.json({success: true});
    });

    return server;
}
