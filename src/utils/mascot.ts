import type {
    MascotAsset,
    MascotAssets,
    MascotCollection,
    MascotState,
    MascotView,
} from '../types/mascot';

function mergeAsset<TAsset>(
    defaultAsset: MascotAsset<TAsset> | undefined,
    overrideAsset: MascotAsset<TAsset> | undefined,
): MascotAsset<TAsset> | undefined {
    if (!overrideAsset) {
        return defaultAsset;
    }
    if (defaultAsset?.type === 'themed' && overrideAsset.type === 'themed') {
        return {...defaultAsset, ...overrideAsset};
    }
    return overrideAsset;
}

/** Merges state-specific mascot assets, with overrides taking precedence. */
export function resolveMascotAssets<TAsset>(
    defaults?: MascotAssets<TAsset>,
    overrides?: MascotAssets<TAsset>,
): MascotAssets<TAsset> | undefined {
    if (!defaults && !overrides) {
        return undefined;
    }

    const states = new Set([
        ...Object.keys(defaults ?? {}),
        ...Object.keys(overrides ?? {}),
    ] as MascotState[]);
    const result: MascotAssets<TAsset> = {};
    states.forEach((state) => {
        const asset = mergeAsset(defaults?.[state], overrides?.[state]);
        if (asset) {
            result[state] = asset;
        }
    });
    return result;
}

/** Merges ready-to-render mascot collections per surface and state. */
export function resolveMascotCollection(
    defaults?: MascotCollection,
    overrides?: MascotCollection,
): MascotCollection | undefined {
    if (!defaults && !overrides) {
        return undefined;
    }
    return {
        hero: {...defaults?.hero, ...overrides?.hero},
        chat: {...defaults?.chat, ...overrides?.chat},
    };
}

/** Selects the active mascot, falling back to the idle mascot for the same surface. */
export function getMascotNode(
    collection: MascotCollection | undefined,
    view: MascotView,
    state: MascotState,
) {
    if (view === 'hero') {
        const heroState = state === 'reading' ? 'reading' : 'idle';
        return collection?.hero?.[heroState] ?? collection?.hero?.idle;
    }
    return collection?.chat?.[state] ?? collection?.chat?.idle;
}
