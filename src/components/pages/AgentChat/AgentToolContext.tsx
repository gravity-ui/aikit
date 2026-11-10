import {Fragment} from 'react';

/** Agent context formatting; the adapter supplies repository paths and result labels. */
/** @experimental May change or be removed in minor releases. */
export function AgentToolContext({text, path}: {text?: string; path?: string}) {
    if (path) {
        return <>{path.split('/').pop()}</>;
    }
    return (
        <>
            {text
                ?.split(/(\b(?:\d+\s+(?:checks\s+)?)?(?:failed|passed)\b)/gi)
                .map((chunk, index) =>
                    /\b(?:failed|passed)$/i.test(chunk) ? (
                        <span
                            key={index}
                            style={{
                                color: /failed$/i.test(chunk)
                                    ? 'var(--g-color-text-danger)'
                                    : 'var(--g-color-text-positive)',
                            }}
                        >
                            {chunk}
                        </span>
                    ) : (
                        <Fragment key={index}>{chunk}</Fragment>
                    ),
                )}
        </>
    );
}
