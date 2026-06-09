import {
    AIDataEntry,
    AnyDepthArray,
    PromptBuilder,
    PromptBuilderExpression,
    PromptBuilderExpressionOptions,
    PromptBuilderParams,
} from './types';

export function AIPrompt<T = unknown>(
    templateParts: TemplateStringsArray,
    ...functions: (string | AnyDepthArray<string> | PromptBuilderExpression<T>)[]
): PromptBuilderParams<T> {
    return [[...templateParts.raw], ...functions];
}

export function createDefaultSystemPromptBuilder<T = unknown>(
    entries: AIDataEntry<T>[],
    options: PromptBuilderExpressionOptions<T>,
): PromptBuilder<T> {
    return (
        templateParts: string[],
        ...functions: (string | AnyDepthArray<string> | PromptBuilderExpression<T>)[]
    ): string => {
        const out = [];

        for (let i = 0; i < templateParts.length; i++) {
            const part = templateParts[i];
            out.push(part);

            const fn = functions[i];

            if (fn) {
                const result = typeof fn === 'function' ? fn(entries, options) : fn;

                if (typeof result === 'string') {
                    out.push(result);
                }

                if (Array.isArray(result)) {
                    // @ts-expect-error - we know that the result is an array of strings, but TS can't handle it (Type instantiation is excessively deep and possibly infinite.)
                    out.push((result.flat(Infinity) as string[]).join('\n\n'));
                }
            }
        }

        return out.join('');
    };
}

export const DEFAULT_SYSTEM_PROMPT_TEMPLATE = AIPrompt<any>`Meta information provided by the user about the current page they are on:

${(entries, options) =>
    entries.map((entry) => {
        const formatted = options.formatData(entry.data);

        return [`### ${entry.label}`, formatted];
    })}
`;
