import {useMemo, useRef} from 'react';

import transform from '@diplodoc/transform';
import '@diplodoc/transform/dist/js/yfm';
import {OptionsType} from '@diplodoc/transform/lib/typings';

import {areOptionsEqual} from '../utils/markdownUtils';
import {parseMarkdownIntoBlocks} from '../utils/parse-blocks';

export function useMarkdownTransform(content: string, options?: OptionsType): string {
    const cacheRef = useRef<Map<string, string>>(new Map());
    const prevOptionsRef = useRef<OptionsType | undefined>(options);

    return useMemo(() => {
        if (!content) {
            return '';
        }

        const optionsChanged = !areOptionsEqual(prevOptionsRef.current, options);
        if (optionsChanged) {
            cacheRef.current.clear();
            prevOptionsRef.current = options;
        }

        try {
            const blocks = parseMarkdownIntoBlocks(content);
            const cache = cacheRef.current;
            const htmlParts: string[] = [];

            for (const block of blocks) {
                let html = cache.get(block);
                if (!html) {
                    try {
                        const result = transform(block, options);
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

            return htmlParts.join('');
        } catch {
            return '';
        }
    }, [content, options]);
}
