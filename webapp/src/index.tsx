import React from 'react';
import ReactDOM from 'react-dom/client';

import Main from './components/main';

window.addEventListener('load', () => {
    const container = document.querySelector('main')!;
    const element = (
        <Main/>
    );

    const root = ReactDOM.createRoot(container);
    root.render(element);
});
