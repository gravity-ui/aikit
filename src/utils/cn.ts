import {withNaming} from '@bem-react/classname';

export type CnMods = Record<string, string | boolean | undefined>;

export const NAMESPACE = 'g-aikit-';

export const cn = withNaming({e: '__', m: '_'});
export const block = withNaming({n: NAMESPACE, e: '__', m: '_'});

export type CnBlock = ReturnType<typeof cn>;

/**
 * Extracts modifiers part from className
 * @param {string} className - The class name to extract modifiers from
 * @returns {string} The modifiers part of the class name
 */
export function modsClassName(className: string) {
    return className.split(/\s(.*)/)[1];
}
