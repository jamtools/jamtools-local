import {GlobalState} from '../state/global_state';

import {Config} from './config_types/config_types';

export type DataResponse<T> = {
    data: T;
}

export type ErrorResponse = {
    error: string;
}

export type APIResponse<T> = {
    message?: string;
} & (
    DataResponse<T> | ErrorResponse
);

export type GetStateAPIResponse = APIResponse<GlobalState>;

export type SetConfigAPIResponse = APIResponse<GlobalState>;
export type SetConfigAPIRequest = {config: Config};

export type SubmitControlPanelActionAPIResponse = APIResponse<GlobalState>;

export const isErrorResponse = (response: APIResponse<unknown>): response is ErrorResponse => {
    return 'error' in response;
};
