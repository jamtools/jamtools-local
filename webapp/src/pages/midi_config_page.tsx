import React from 'react';

import {useGlobalState} from '../hooks/use_global_state';

export default function MidiConfigPage() {
    const {
        messages,
    } = useGlobalState();

    return (
        <div>
            Time to config the midi
        </div>
    );
}
