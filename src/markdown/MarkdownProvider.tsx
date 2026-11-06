'use client';

import {type ComponentType, type ReactNode, createContext, useContext} from 'react';

import type {MarkdownRendererProps} from './types';

export const MarkdownContext = createContext<ComponentType<MarkdownRendererProps> | undefined>(
    undefined,
);

export interface MarkdownProviderProps {
    renderer: ComponentType<MarkdownRendererProps>;
    children: ReactNode;
}

/** Supplies a renderer to all Markdown content in the chat subtree. */
export function MarkdownProvider({renderer, children}: MarkdownProviderProps) {
    return <MarkdownContext.Provider value={renderer}>{children}</MarkdownContext.Provider>;
}

/** Internal rendering slot; the custom-markdown entry deliberately has no built-in renderer. */
export function MarkdownContent(props: MarkdownRendererProps) {
    const Renderer = useContext(MarkdownContext);
    if (!Renderer) {
        throw new Error(
            'AIKit: wrap components from @gravity-ui/aikit/custom-markdown in a MarkdownProvider.',
        );
    }
    return <Renderer {...props} />;
}
