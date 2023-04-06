import {ConfigState} from './config_state'
import {ProgressionState} from './progression_state';
import {UserDataState} from './user_data_state';

export type GlobalState = {
    config: ConfigState;
    progression: ProgressionState;
    userData: UserDataState;
}
