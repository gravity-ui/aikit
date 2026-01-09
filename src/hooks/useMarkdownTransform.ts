import {useMemo, useRef} from 'react';

import transform from '@diplodoc/transform';
import '@diplodoc/transform/dist/js/yfm';
import {OptionsType} from '@diplodoc/transform/lib/typings';

import {parseMarkdownIntoBlocks} from '../utils/parse-blocks';

function areOptionsEqual(prev?: OptionsType, next?: OptionsType): boolean {
    if (prev === next) {
        return true;
    }
    if (!prev || !next) {
        return false;
    }
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    if (prevKeys.length !== nextKeys.length) {
        return false;
    }
    for (const key of prevKeys) {
        if (prev[key] !== next[key]) {
            return false;
        }
    }
    return true;
}

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

            return htmlParts.join('');
        } catch {
            return '';
        }
    }, [content, options]);
}
