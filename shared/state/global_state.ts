import {ConfigState} from './config_state'
import {AdhocProgressionState, ProgressionState} from './progression_state';
import {UserDataState} from './user_data_state';

export type GlobalState = {
    config: ConfigState;
    adhocState?: AdhocProgressionState;
    // progression?: ProgressionState;
    userData: UserDataState;
}
