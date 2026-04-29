import {toYamlLike} from './toYamlLike';
import type {AIDataEntry, BuildAIContextOptions} from './types';

export const AI_CONTEXT_SYSTEM_PROMPT_HEADER = `Meta information provided by the user about the current page they are on:\n\n`;

/**
 * Formats AI data entries into a system prompt string.
 * Uses YAML-like format by default, can be overridden via options.formatData.
 */
export function buildAIContextSystemPrompt(
    entries: AIDataEntry[],
    options?: BuildAIContextOptions,
): string {
    if (entries.length === 0) return '';

    const format = options?.formatData ?? toYamlLike;

    const sections = entries.map((entry) => `### ${entry.it}\n${format(entry.data)}`);

    return `${AI_CONTEXT_SYSTEM_PROMPT_HEADER}${sections.join('\n\n')}`;
}
