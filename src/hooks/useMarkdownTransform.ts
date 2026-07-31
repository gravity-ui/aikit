import {useMemo, useRef} from 'react';

import {isWithMdxArtifacts} from '@diplodoc/mdx-extension';
import type {MdxArtifacts} from '@diplodoc/mdx-extension';
import transform from '@diplodoc/transform';
import '@diplodoc/transform/dist/js/yfm.js';
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
