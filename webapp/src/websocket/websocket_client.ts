import {ReplaySubject, Subject} from 'rxjs';

import io from 'socket.io-client'
// import {Action, Thunk, thunk} from 'easy-peasy'
// import { IGlobalStore, IHandleMessageActions } from './store-types'
// import { WEBSOCKET_CONNECT_STRING } from '../config';

export type WebsocketMessage<T> = {
    type: string;
    flash?: boolean;
} & ({
    data: T;
} | {
    error: string;
});

const WEBSOCKET_CONNECT_STRING = `http://${window.location.hostname}:1337`;

let socket: io;

const websocketMessageSubject: Subject<WebsocketMessage<any>> = new ReplaySubject();

export const sendMessage = <T>(message: WebsocketMessage<T>) => {
    if (!socket) {
        initSocket();
    }

    socket.send(message)
};

const initSocket = () => {
    socket = io(WEBSOCKET_CONNECT_STRING);
    socket.on('message', (message: WebsocketMessage<any>) => {
        websocketMessageSubject.next(message);
    });
}

export const subscribeToMessages = (callback: (msg: WebsocketMessage<any>) => void) => {
    if (!socket) {
        initSocket();
    }

    websocketMessageSubject.subscribe(callback);
}

subscribeToMessages(console.log);

    // const actions = {
    //   updateProgressions: dispatch.progressions.updateProgressionsFromMessage,
    // } as IHandleMessageActions

    // const action = actions[message.type]
    // action(message)
// };


// export interface IWebsocketStore {
//     socket?: SocketIOClient.Socket,
//     setSocket: Action<IWebsocketStore, SocketIOClient.Socket>,
//     init: Thunk<IWebsocketStore>,
//     sendMessage: Thunk<IWebsocketStore, WebsocketMessage, void, IGlobalStore>,
//     handleMessage: Thunk<IWebsocketStore, WebsocketMessage, void, IGlobalStore>,
// }

// export const WebsocketStore: IWebsocketStore = {
//     socket: undefined,

//     setSocket: (state, socket: any) => {
//         state.socket = socket
//     },

//     init: thunk(actions => {
//         const socket = io(WEBSOCKET_CONNECT_STRING)
//         actions.setSocket(socket)
//         socket.on('message', (msg: WebsocketMessage) => actions.handleMessage(msg))
//     }),

//     sendMessage: thunk((actions, message: WebsocketMessage, {getState}) => {
//         const socket = getState().websocket.socket as any
//         if (socket) {
//             socket.send(message)
//         }
//     }),

//     handleMessage: thunk((_, message: WebsocketMessage, {dispatch}) => {
//         const actions = {
//             updateProgressions: dispatch.progressions.updateProgressionsFromMessage,
//         } as IHandleMessageActions

//         const action = actions[message.type]
//         action(message)
//     }),
// }

// export default WebsocketStore
