import React from 'react';

import {
    BrowserRouter,
    Routes,
    Route,
    Link,
} from 'react-router-dom';

import PerformancePage from '../pages/performance_page';
import MidiConfigPage from '../pages/midi_config_page';

export default function Main() {
    return (
        <BrowserRouter>
            <div>
                <nav>
                    <ul>
                        <li>
                            <Link to='/'>Home</Link>
                        </li>
                        <li>
                            <Link to='/midi_config'>Midi Config</Link>
                        </li>
                    </ul>
                </nav>

                <Routes>
                    <Route
                        path='/'
                        element={<PerformancePage/>}
                    />
                    <Route
                        path='/midi_config'
                        element={<MidiConfigPage/>}
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
