import type {RefObject} from 'react';

import {useMdx} from '@diplodoc/mdx-extension';
import type {MdxArtifacts} from '@diplodoc/mdx-extension';
import type {MDXComponents} from 'mdx/types';

import {MdxDataContext} from './MdxContext';

export interface MdxPortalsProps {
    /** Ref to the container element into which the rendered HTML is injected. */
    refCtr: RefObject<HTMLDivElement | null>;
    /** HTML produced by the markdown transform for the current content. */
    html: string;
    /** Map of components rendered from embedded MDX/JSX in the markdown content. */
    components?: MDXComponents;
    /** Artifacts collected by the MDX transform, required to hydrate the components. */
    mdxArtifacts?: MdxArtifacts;
    /** Arbitrary value exposed to the MDX components through {@link MdxDataContext}. */
    mdxContext?: Record<string, unknown>;
}

export function MdxPortals({refCtr, html, components, mdxArtifacts, mdxContext}: MdxPortalsProps) {
    const portals = useMdx({
        refCtr,
        html,
        components,
        mdxArtifacts,
        contextList: [MdxDataContext],
    });

    return <MdxDataContext.Provider value={mdxContext}>{portals}</MdxDataContext.Provider>;
}

MdxPortals.displayName = 'MdxPortals';
