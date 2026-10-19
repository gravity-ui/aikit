import {useEffect, useState} from 'react';

import {TextInput} from '@gravity-ui/uikit';
import chroma from 'chroma-js';

export function ColorField({
    label,
    value,
    onChange,
    allowReference = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    allowReference?: boolean;
}) {
    const [draft, setDraft] = useState(value);
    useEffect(() => setDraft(value), [value]);
    const validColor = chroma.valid(draft);
    const valid = !draft || validColor || (allowReference && /^var\(--g-[a-z0-9-]+\)$/.test(draft));
    const change = (next: string) => {
        setDraft(next);
        if (
            (!next && allowReference) ||
            chroma.valid(next) ||
            (allowReference && /^var\(--g-[a-z0-9-]+\)$/.test(next))
        ) {
            onChange(next);
        }
    };
    return (
        <div className="aikit-themer__field">
            <span>{label}</span>
            <div className="aikit-themer__color-field">
                <input
                    type="color"
                    aria-label={`${label} color picker`}
                    value={validColor ? chroma(draft).hex() : '#808080'}
                    onChange={(event) => change(event.target.value)}
                />
                <TextInput
                    controlProps={{'aria-label': label}}
                    value={draft}
                    onUpdate={change}
                    validationState={valid ? undefined : 'invalid'}
                    errorMessage="Enter a color or a supported CSS variable."
                />
            </div>
        </div>
    );
}
