import {useEffect, useId, useRef} from 'react';

import {block} from '../../../utils/cn';

import type {GravityMascotProps} from './GravityMascot';
import {gravityMascotAssets} from './gravityMascotAssets';

const b = block('chat-container');
const chatAssets = {
    ...gravityMascotAssets,
    idle: gravityMascotAssets.chatIdle,
    reading: gravityMascotAssets.chatReading,
};

/** Loaded only when a built-in mascot is rendered. */
export function GravityMascotRenderer({state, view, animated = true}: GravityMascotProps) {
    const instanceId = useId();
    const ref = useRef<HTMLDivElement>(null);
    const Asset =
        view === 'hero'
            ? gravityMascotAssets[state === 'reading' ? 'heroReading' : 'heroIdle']
            : chatAssets[state];

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const svg = ref.current?.querySelector('svg');
        const update = () => {
            // CSS handles CSS animations; SVG timelines also need to be paused for SMIL animations.
            if (!animated || media.matches) {
                svg?.pauseAnimations();
            } else {
                svg?.unpauseAnimations();
            }
        };
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, [animated, state, view]);

    return (
        <div
            ref={ref}
            className={b('default-mascot', {view, animation: animated ? 'on' : 'off'})}
            aria-hidden="true"
        >
            <Asset key={`${view}-${state}`} id={`g-aikit-zk-${instanceId}`} />
        </div>
    );
}
