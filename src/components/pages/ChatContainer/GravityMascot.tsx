import {useEffect, useId, useRef} from 'react';

import type {MascotCollection, MascotState, MascotView} from '../../../types/mascot';
import {block} from '../../../utils/cn';

import {gravityMascotAssets} from './gravityMascotAssets';

import './GravityMascot.scss';

const b = block('chat-container');
const chatAssets = {
    ...gravityMascotAssets,
    idle: gravityMascotAssets.chatIdle,
    reading: gravityMascotAssets.chatReading,
};

/** Internal renderer for the bundled Gravity mascot. */
export function GravityMascot({
    state,
    view,
    animated = true,
}: {
    state: MascotState;
    view: MascotView;
    animated?: boolean;
}) {
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

export const defaultGravityMascots: MascotCollection = {
    hero: {
        idle: <GravityMascot state="idle" view="hero" />,
        reading: <GravityMascot state="reading" view="hero" />,
    },
    chat: {
        reveal: <GravityMascot state="reveal" view="chat" />,
        thinking: <GravityMascot state="thinking" view="chat" />,
        done: <GravityMascot state="done" view="chat" />,
        idle: <GravityMascot state="idle" view="chat" />,
        reading: <GravityMascot state="reading" view="chat" />,
        error: <GravityMascot state="error" view="chat" />,
        stopped: <GravityMascot state="stopped" view="chat" />,
        sleeping: <GravityMascot state="sleeping" view="chat" />,
        listening: <GravityMascot state="listening" view="chat" />,
        speaking: <GravityMascot state="speaking" view="chat" />,
    },
};
