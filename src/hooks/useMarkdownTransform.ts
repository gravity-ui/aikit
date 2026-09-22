import {useMemo, useRef} from 'react';

import {isWithMdxArtifacts} from '@diplodoc/mdx-extension';
import type {MdxArtifacts} from '@diplodoc/mdx-extension';
import transform from '@diplodoc/transform';
// The SPLIT runtime, not the combined `dist/js/yfm.js`, matching what
// @gravity-ui/markdown-editor imports. Both forms attach global document
// listeners at import time with no guard against double registration, so an
// app using aikit alongside markdown-editor (or importing the runtime itself,
// which is documented in split form) bundled two distinct modules with
// identical side effects. Every listener fired twice: a YFM term click opened
// the popup and then immediately hit the isSameTerm branch and closed it, so
// term popups never stayed open, and code-copy buttons double-fired. Importing
// the same files lets the bundler dedupe to one runtime instance.
//
// Order between the two is irrelevant - each is a self-contained IIFE with
// its own copy of the shared helpers and no import-time dependency on the
// other - so they are listed in the order import/order wants.
import '@diplodoc/transform/dist/js/_yfm-only.js';
import '@diplodoc/transform/dist/js/base.js';
import {OptionsType} from '@diplodoc/transform/lib/typings';

import {areOptionsEqual, mergeMarkdownTransformOptions} from '../utils/markdownUtils';
import {parseMarkdownIntoBlocks} from '../utils/parse-blocks';

export interface MarkdownTransformResult {
    html: string;
    mdxArtifacts?: MdxArtifacts;
}

export function useMarkdownTransform(
    content: string,
    options?: OptionsType,
    enableMdx = false,
): MarkdownTransformResult {
    const cacheRef = useRef<Map<string, string>>(new Map());
    const prevOptionsRef = useRef<OptionsType | undefined>(options);

    const lastMdxResultRef = useRef<MarkdownTransformResult | null>(null);

    return useMemo(() => {
        if (!content) {
            return {html: ''};
        }

        const optionsChanged = !areOptionsEqual(prevOptionsRef.current, options);
        if (optionsChanged) {
            cacheRef.current.clear();
            lastMdxResultRef.current = null;
            prevOptionsRef.current = options;
        }

        const transformOptions = mergeMarkdownTransformOptions(options);

        // MDX components (and their collected artifacts) can span multiple markdown
        // blocks, so the block-level caching used for streaming would break artifact
        // collection. Transform the whole content in a single pass when MDX is enabled.
        if (enableMdx) {
            try {
                const {result} = transform(content, transformOptions);
                isWithMdxArtifacts(result);

                const mdxResult: MarkdownTransformResult = {
                    html: result.html ?? '',
                    mdxArtifacts: result.mdxArtifacts,
                };

                lastMdxResultRef.current = mdxResult;

                return mdxResult;
            } catch {
                return lastMdxResultRef.current ?? {html: ''};
            }
        }

        try {
            const blocks = parseMarkdownIntoBlocks(content);
            const cache = cacheRef.current;
            const htmlParts: string[] = [];

            for (const block of blocks) {
                let html = cache.get(block);
                if (!html) {
                    try {
                        const result = transform(block, transformOptions);
                        html = result.result.html;
                        cache.set(block, html);
                    } catch {
                        html = '';
                    }
                }
                htmlParts.push(html);
            }

            const currentBlocksSet = new Set(blocks);
            for (const key of cache.keys()) {
                if (!currentBlocksSet.has(key)) {
                    cache.delete(key);
                }
            }

            return {html: htmlParts.join('')};
        } catch {
            return {html: ''};
        }
    }, [content, options, enableMdx]);
}
