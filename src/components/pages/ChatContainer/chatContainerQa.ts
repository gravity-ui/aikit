import type {ChatContainerQa} from './types';

/**
 * Normalizes ChatContainer `qa` prop: string maps to root only (backward compatible).
 *
 * @param qa - Raw `qa` from props: string (root only), full map, or undefined.
 * @returns Always a {@link ChatContainerQa} object (`{}`, `{root}`, or the given map).
 */
export function normalizeChatContainerQa(
    qa: string | ChatContainerQa | undefined,
): ChatContainerQa {
    if (qa === undefined) {
        return {};
    }
    if (typeof qa === 'string') {
        return {root: qa};
    }
    return qa;
}

/**
 * Resolves a single qa value: explicit key wins, then `prefix-suffix`, else undefined.
 *
 * @param qaMap - Normalized QA map (see {@link normalizeChatContainerQa}).
 * @param key - Which QA slot to resolve (`prefix` always yields undefined).
 * @param suffixForPrefix - Suffix appended when only `prefix` is set.
 * @returns Resolved `data-qa` string, or undefined when nothing applies.
 */
export function resolveChatContainerQa(
    qaMap: ChatContainerQa,
    key: keyof ChatContainerQa,
    suffixForPrefix: string,
): string | undefined {
    if (key === 'prefix') {
        return undefined;
    }
    const explicit = qaMap[key];
    if (typeof explicit === 'string' && explicit.length > 0) {
        return explicit;
    }
    if (qaMap.prefix) {
        return `${qaMap.prefix}-${suffixForPrefix}`;
    }
    return undefined;
}

/**
 * Root `data-qa`: explicit `root`, else `prefix` when only prefix is set.
 *
 * @param qaMap - Normalized QA map.
 * @returns Value for the container root element, or undefined.
 */
export function resolveChatContainerRootQa(qaMap: ChatContainerQa): string | undefined {
    return qaMap.root ?? qaMap.prefix;
}
