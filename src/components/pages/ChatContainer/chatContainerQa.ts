import type {ChatContainerQa} from './types';

/**
 * Normalizes ChatContainer `qa` prop: string maps to root only (backward compatible).
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

/** Root `data-qa`: explicit `root`, else `prefix` when only prefix is set. */
export function resolveChatContainerRootQa(qaMap: ChatContainerQa): string | undefined {
    return qaMap.root ?? qaMap.prefix;
}
