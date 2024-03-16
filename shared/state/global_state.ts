import {ApplicationModeName} from '../constants/application_mode_constants';

import type {ConfigState} from './config_state';
import type {AdhocProgressionState, ProgressionState} from './progression_state';
import type {UserDataState} from './user_data_state';

export type GlobalState = {
    currentMode: ApplicationModeName | undefined;
    config: ConfigState;
    adhocState?: AdhocProgressionState;
    progression?: ProgressionState;
    userData: UserDataState;
}
