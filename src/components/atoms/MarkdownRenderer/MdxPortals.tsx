import {useEffect, useState} from 'react';
import type {RefObject} from 'react';

import {useMdx} from '@diplodoc/mdx-extension';
import type {IdMdxComponentLoader, MdxArtifacts} from '@diplodoc/mdx-extension';
import type {MDXComponents, MDXModule, MDXProps} from 'mdx/types';
import * as runtime from 'react/jsx-runtime';

import {MdxDataContext} from './MdxContext';
import {asyncExecuteCode} from './asyncExecuteCode';

interface MdxLoaderState extends IdMdxComponentLoader {
    idMdx?: Record<string, string>;
}

function useMdxComponentLoader(mdxArtifacts: MdxArtifacts | undefined, nonce?: string) {
    const idMdx = mdxArtifacts?.idMdx;
    const [state, setState] = useState<MdxLoaderState>({isSuccess: false});

    useEffect(() => {
        let isActive = true;

        (async () => {
            try {
                const data: Record<string, React.ComponentType<MDXProps>> = {};

                for (const [artifactId, code] of Object.entries(idMdx ?? {})) {
                    const fn = await asyncExecuteCode<(jsxRuntime: typeof runtime) => MDXModule>(
                        code,
                        nonce,
                    );

                    if (!isActive) {
                        return;
                    }

                    data[artifactId] = fn(runtime).default;
                }

                if (isActive) {
                    setState({idMdx, data, isSuccess: true});
                }
            } catch {
                if (isActive) {
                    setState({idMdx, isSuccess: false});
                }
            }
        })();

        return () => {
            isActive = false;
        };
    }, [idMdx, nonce]);

    if (state.idMdx !== idMdx) {
        return {isSuccess: false};
    }

    return state;
}

export interface MdxPortalsProps {
    /** Ref to the container element into which the rendered HTML is injected. */
    refCtr: RefObject<HTMLDivElement | null>;
    /** HTML produced by the markdown transform for the current content. */
    html: string;
    /** Map of components rendered from embedded MDX/JSX in the markdown content. */
    components?: MDXComponents;
    /** Artifacts collected by the MDX transform, required to hydrate the components. */
    mdxArtifacts?: MdxArtifacts;
    /** CSP nonce applied to scripts that execute compiled MDX artifacts. */
    nonce?: string;
    /** Arbitrary value exposed to the MDX components through {@link MdxDataContext}. */
    mdxContext?: Record<string, unknown>;
}

export function MdxPortals({
    refCtr,
    html,
    components,
    mdxArtifacts,
    nonce,
    mdxContext,
}: MdxPortalsProps) {
    const idMdxComponentLoader = useMdxComponentLoader(mdxArtifacts, nonce);
    const portals = useMdx({
        refCtr,
        html,
        components,
        mdxArtifacts,
        contextList: [MdxDataContext],
        idMdxComponentLoader,
    });

    return <MdxDataContext.Provider value={mdxContext}>{portals}</MdxDataContext.Provider>;
}

MdxPortals.displayName = 'MdxPortals';
