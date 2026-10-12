import type {CSSProperties} from 'react';

import {GravityMascot} from '../../components/pages/ChatContainer/GravityMascot';
import type {MascotState} from '../../types/mascot';

export type TestMascotProps = {
    state?: MascotState;
    size?: CSSProperties['inlineSize'];
    animated?: boolean;
    decorative?: boolean;
};

/** Shared Gravity mascot fixture for stories and component tests. */
export function TestMascot({
    state = 'idle',
    size = '6rem',
    animated = false,
    decorative = false,
}: TestMascotProps) {
    return (
        <div
            aria-hidden={decorative || undefined}
            aria-label={decorative ? undefined : `Mascot: ${state}`}
            data-qa="test-mascot"
            role={decorative ? undefined : 'img'}
            style={{'--g-aikit-mascot-chat-size': size} as CSSProperties}
        >
            <GravityMascot state={state} view="chat" animated={animated} />
        </div>
    );
}
