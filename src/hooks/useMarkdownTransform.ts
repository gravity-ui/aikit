import {useMemo, useRef} from 'react';

import {isWithMdxArtifacts} from '@diplodoc/mdx-extension';
import type {MdxArtifacts} from '@diplodoc/mdx-extension';
import transform from '@diplodoc/transform';
import '@diplodoc/transform/dist/js/yfm.js';
import {OptionsType} from '@diplodoc/transform/lib/typings';

import {
    MARKDOWN_CODE_BLOCKS_ENV_KEY,
    type MarkdownCodeBlockArtifact,
} from '../utils/markdownCodeBlockPlugin';
import {areOptionsEqual, mergeMarkdownTransformOptions} from '../utils/markdownUtils';
import {parseMarkdownIntoBlocks} from '../utils/parse-blocks';

export interface MarkdownTransformResult {
    html: string;
    mdxArtifacts?: MdxArtifacts;
    codeBlocks?: MarkdownCodeBlockArtifact[];
}

interface CachedMarkdownBlock {
    codeBlocks: MarkdownCodeBlockArtifact[];
    html: string;
}

const getCodeBlocks = (result: object) => {
    const codeBlocks = (result as {[MARKDOWN_CODE_BLOCKS_ENV_KEY]?: unknown})[
        MARKDOWN_CODE_BLOCKS_ENV_KEY
    ];

    return Array.isArray(codeBlocks) ? (codeBlocks as MarkdownCodeBlockArtifact[]) : [];
};

export function useMarkdownTransform(
    content: string,
    options?: OptionsType,
    enableMdx = false,
): MarkdownTransformResult {
    const cacheRef = useRef<Map<string, CachedMarkdownBlock>>(new Map());
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
                    codeBlocks: getCodeBlocks(result),
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
            const codeBlocks: MarkdownCodeBlockArtifact[] = [];

            for (const block of blocks) {
                let cachedBlock = cache.get(block);
                if (!cachedBlock) {
                    try {
                        const result = transform(block, transformOptions);
                        cachedBlock = {
                            html: result.result.html,
                            codeBlocks: getCodeBlocks(result.result),
                        };
                        cache.set(block, cachedBlock);
                    } catch {
                        cachedBlock = {html: '', codeBlocks: []};
                    }
                }
                htmlParts.push(cachedBlock.html);
                codeBlocks.push(...cachedBlock.codeBlocks);
            }

            const currentBlocksSet = new Set(blocks);
            for (const key of cache.keys()) {
                if (!currentBlocksSet.has(key)) {
                    cache.delete(key);
                }
            }

            return {html: htmlParts.join(''), codeBlocks};
        } catch {
            return {html: ''};
        }
    }, [content, options, enableMdx]);
}
