import React, {useEffect, useState} from 'react';

type ControlButtonProps = {
    buttonName?: string;
    buttonMapping?: ControlButtonMapping;
    submit: (mapping: ControlButtonMapping | null) => void;
};

export default function ControlButtonEditor({buttonName, buttonMapping, submit}: ControlButtonProps) {
    const [name, setName] = useState<string>(buttonName || '');
    const [channel, setChannel] = useState<number | null>(buttonMapping?.channel || null);
    const [note, setNote] = useState<number | null>(buttonMapping?.note || null);

    useEffect(() => {
        setChannel(buttonMapping?.channel ?? null);
        setNote(buttonMapping?.note ?? null);
    }, [buttonMapping]);

    useEffect(() => {
        setName(buttonName || '');
    }, [buttonName]);

    return (
        <div>
            <label>Button Name:</label>
            <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={true}
            />

            <label>Channel:</label>
            <input
                type='number'
                value={channel?.toString() || ''}
                onChange={(e) => setChannel(Number(e.target.value))}
            />

            <label>Note:</label>
            <input
                type='number'
                value={note?.toString() || ''}
                onChange={(e) => setNote(Number(e.target.value))}
            />

            <button
                type='button'
                onClick={() => submit({channel: channel!, note: note!})}
            >
                Save
            </button>
        </div>
    );
}

type ControlButtonMapping = {
    channel: number;
    note: number;
} | null;
