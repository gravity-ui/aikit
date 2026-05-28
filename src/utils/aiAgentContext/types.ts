/**
 * Props for AIData component and useProvideAIData hook
 */
export interface AIDataProps<T = unknown> {
    /** Human-readable description of what this data represents */
    it: string;
    /** The actual data to expose to the AI agent */
    data: T;
}

/**
 * Entry returned by getData()
 */
export interface AIDataEntry<T = unknown> {
    /** Human-readable description of what this data represents */
    it: string;
    /** The actual data */
    data: T;
}

/**
 * Public API returned by useAIAgentContext()
 */
export interface AIAgentContextAPI<T = unknown> {
    /** Returns the current list of all registered data entries */
    getData: () => AIDataEntry<T>[];
}

export type AnyDepthArray<T> = Array<T | AnyDepthArray<T>>;

/**
 * Expression for a prompt builder, used to build the part of system prompt.
 * Returns the string part of the system prompt.
 */
export type PromptBuilderExpression<T = unknown> = (
    entries: AIDataEntry<T>[],
    options: PromptBuilderExpressionOptions<T>,
) => string | AnyDepthArray<string>;

export interface PromptBuilderExpressionOptions<T = unknown> {
    formatData: (data: T) => string;
}

/**
 * Prompt builder **Tagged Template Literal** function.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
 */
export type PromptBuilder<T = unknown> = (
    templateParts: string[],
    ...functions: (string | AnyDepthArray<string> | PromptBuilderExpression<T>)[]
) => string;

export type PromptBuilderParams<T = unknown> = Parameters<PromptBuilder<T>>;

/**
 * Options for buildAIContextSystemPrompt
 */
export interface BuildAIContextOptions<T = unknown> {
    /**
     * System prompt **template literal**. Use this, if you want to customize the system prompt or create on the fly.
     * If not provided, a default system prompt template literal will be used (see example below).
     *
     * Use `AIPrompt` helper function to create a valid template.
     *
     * If you ever worked with styled-components, this is similar to the `styled` function.
     *
     * @example
     * ```ts
     * // Like in styled-components, use backticks to create a template literal.
     * AIPrompt`Meta information provided by the user about the current page they are on:
     *
     * ${(entries, options) => entries.map((entry) =>
     *     // Each function inside the template literal has access to the entries and options from context:
     *     `### ${entry.it}/n${options.formatData(entry.data)}`
     * )}
     * `
     *
     * ```
     */
    template?: PromptBuilderParams<T>;
    /**
     * Custom data formatter.
     * This function is used to convert JS objects to a LLM-readable string.
     *
     * Defaults to YAML-like serializer.
     *
     * @example
     * ```ts
     * formatData: (data) => JSON.stringify(data, null, 2)
     * ```
     */
    formatData?: (data: unknown) => string;
}

/**
 * Internal context value. Not exported to consumers.
 */
export interface AIAgentContextValue<T = unknown> {
    register: (id: string, getter: () => AIDataProps<T>) => void;
    unregister: (id: string) => void;
    getData: () => AIDataEntry<T>[];
}
