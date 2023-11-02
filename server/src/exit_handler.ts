import process from 'node:process';

import type App from '@shared/app';

export const exitHandler = (app: App) => {
    // so the program will not close instantly
    app.deps.stdin.resume();

    const handle = (options) => {
        if (options.cleanup) {
            app.close();
        }
        if (options.exit) {
            process.exit();
        }
    };

    // always runs after other handlers
    process.on('exit', handle.bind(null, {cleanup: true}));

    // catches ctrl+c event
    process.on('SIGINT', handle.bind(null, {exit: true}));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', handle.bind(null, {exit: true}));
    process.on('SIGUSR2', handle.bind(null, {exit: true}));

    // process.on('uncaughtException', handle.bind(null, {exit: true}));
};
