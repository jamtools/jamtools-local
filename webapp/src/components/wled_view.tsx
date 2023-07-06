import React, {useState, useRef, useEffect} from 'react';

import {WLEDClient as WLEDClient2} from 'wled-client';

import {setRandomColor} from '../wled';

const WLEDClient = WLEDClient2.WLEDClient as unknown as WLEDClient2;

export default function WledView() {
    const wledClient = useRef<WLEDClient2 | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                // const ip = '192.168.0.241';
                const ip = '192.168.0.199';
                const client = new WLEDClient(ip);
                await client.init();
                wledClient.current = client;
            } catch (e) {
                setError(String(e));
            }
        })();
    }, []);

    const changeColor = () => {
        if (!wledClient.current) {
            setError('No WLED client found');
            return;
        }

        setRandomColor(wledClient.current);
    };

    return (
        <div>
            <h1>
                {error}
            </h1>
            <button onClick={changeColor}>
                Change color
            </button>
        </div>
    );
}
