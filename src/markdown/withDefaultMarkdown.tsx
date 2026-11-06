'use client';

import {type ComponentType, useContext} from 'react';

import {MarkdownRenderer} from '../components/atoms/MarkdownRenderer';

import {MarkdownContext, MarkdownProvider} from './MarkdownProvider';

/** Preserves the default renderer for existing public component entry points. */
export function withDefaultMarkdown<P extends object>(Component: ComponentType<P>) {
    function WithDefaultMarkdown(props: P) {
        const renderer = useContext(MarkdownContext);
        if (renderer) {
            return <Component {...props} />;
        }
        return (
            <MarkdownProvider renderer={MarkdownRenderer}>
                <Component {...props} />
            </MarkdownProvider>
        );
    }
    WithDefaultMarkdown.displayName = `withDefaultMarkdown(${Component.displayName || Component.name})`;
    return WithDefaultMarkdown;
}
