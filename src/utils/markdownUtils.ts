import {OptionsType} from '@diplodoc/transform/lib/typings';

import {markdownTableWrapPlugin} from './markdownTableWrapPlugin';

export function areOptionsEqual(prev?: OptionsType, next?: OptionsType): boolean {
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

/** AIKit default transform plugins; user plugins from `transformOptions` are appended after. */
export function mergeMarkdownTransformOptions(options?: OptionsType): OptionsType {
    const userPlugins = options?.plugins ?? [];

    return {
        ...options,
        plugins: [markdownTableWrapPlugin, ...userPlugins],
    };
}
