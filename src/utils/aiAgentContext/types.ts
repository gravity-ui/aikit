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

/**
 * Options for buildAIContextSystemPrompt
 */
export interface BuildAIContextOptions {
    /** Custom data formatter. Defaults to YAML-like serializer */
    formatData?: (data: unknown) => string;
}

/**
 * Internal context value. Not exported to consumers.
 */
export interface AIAgentContextValue {
    register: (id: string, getter: () => AIDataProps) => void;
    unregister: (id: string) => void;
    getData: () => AIDataEntry[];
}
