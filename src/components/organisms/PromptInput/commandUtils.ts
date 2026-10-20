import type {PromptCommandSource} from '../../../types';

export type CommandMatch = {sourceId: string; query: string; start: number; end: number};

/** Match only a whitespace-delimited token at a collapsed caret. */
export function findCommandMatch(
    value: string,
    start: number,
    end: number,
    sources: readonly PromptCommandSource[],
): CommandMatch | undefined {
    if (start !== end) return undefined;
    const match = /(?:^|\s)([/@])([^\s/@]*)$/.exec(value.slice(0, start));
    if (!match) return undefined;
    const source = sources.find((item) => item.trigger === match[1]);
    if (!source) return undefined;
    const tokenStart = start - match[2].length - 1;
    const suffix = /^[^\s/@]*/.exec(value.slice(start))?.[0] ?? '';
    return {sourceId: source.id, query: match[2], start: tokenStart, end: start + suffix.length};
}

export function replaceCommand(
    value: string,
    match: Pick<CommandMatch, 'start' | 'end'>,
    text = '',
) {
    const insertion = text && !/\s$/.test(text) ? `${text} ` : text;
    return {
        value: value.slice(0, match.start) + insertion + value.slice(match.end),
        caret: match.start + insertion.length,
    };
}
