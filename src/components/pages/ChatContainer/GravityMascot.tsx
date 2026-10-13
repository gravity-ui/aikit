import {Suspense, lazy} from 'react';

import type {MascotCollection, MascotState, MascotView} from '../../../types/mascot';
import {block} from '../../../utils/cn';

import './GravityMascot.scss';

const b = block('chat-container');
const LazyGravityMascotRenderer = lazy(() =>
    import('./GravityMascotRenderer.js').then(({GravityMascotRenderer}) => ({
        default: GravityMascotRenderer,
    })),
);

export interface GravityMascotProps {
    state: MascotState;
    view: MascotView;
    animated?: boolean;
}

/** Internal renderer for the bundled Gravity mascot. */
export function GravityMascot({state, view, animated = true}: GravityMascotProps) {
    return (
        <Suspense fallback={<div className={b('default-mascot', {view})} aria-hidden="true" />}>
            <LazyGravityMascotRenderer state={state} view={view} animated={animated} />
        </Suspense>
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
