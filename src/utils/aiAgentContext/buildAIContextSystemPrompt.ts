import {DEFAULT_SYSTEM_PROMPT_TEMPLATE, createDefaultSystemPromptBuilder} from './templateStrings';
import {toYamlLike} from './toYamlLike';
import type {AIDataEntry, BuildAIContextOptions, PromptBuilderParams} from './types';

/**
 * Formats AI data entries into a system prompt string.
 * Uses YAML-like format by default, can be overridden via options.formatData.
 * Uses prompt builder to build the system prompt from **Template Literal**. See `createDefaultSystemPromptBuilder` for more details.
 */
export function buildAIContextSystemPrompt<T = unknown>(
    entries: AIDataEntry<T>[],
    options: BuildAIContextOptions<T> = {},
): string {
    if (entries.length === 0) return '';

    const builder = createDefaultSystemPromptBuilder<T>(entries, {
        formatData: options.formatData ?? toYamlLike,
    });

    const template: PromptBuilderParams<T> = options.template ?? DEFAULT_SYSTEM_PROMPT_TEMPLATE;

    return builder(...template);
}
