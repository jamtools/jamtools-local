import React from 'react';
import ReactDOM from 'react-dom/client';

import {ActionHandler} from './actions/app_actions';
import {LocalActionHandler} from './actions/action_handler_local';
import {RemoteActionHandler} from './actions/action_handler_remote';

import Main from './components/main';

type ImportMeta = {
    env: {
        LOCAL_MODE?: string;
    };
}

let actionHandler: ActionHandler;

const localMode = (import.meta as unknown as ImportMeta).env.LOCAL_MODE === 'true';
if (localMode) {
    actionHandler = new LocalActionHandler();
} else {
    actionHandler = new RemoteActionHandler();
}

window.addEventListener('load', () => {
    const container = document.querySelector('main')!;
    const element = (
        <Main
            actionHandler={actionHandler}
            // localMode={localMode}
        />
    );

    const root = ReactDOM.createRoot(container);
    root.render(element);
});
