import type React from 'react';

import type {JSONSchema7} from 'json-schema';

import {type ArgsSchema, normalizeSchema} from './schema';
import type {
    GenUIComponentProps,
    GenUIErrorProps,
    GenUILoadingProps,
    GenUITool,
    GenUIToolRegistry,
} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodLike<T = any> = {
    readonly _def?: unknown;
    safeParse: (
        input: unknown,
    ) => {success: true; data: T} | {success: false; error: {issues: unknown[]; message: string}};
};

/** Shape accepted by {@link registerGenUITool}. Schema is denormalized on entry. */
export type GenUIToolDefinition<TArgs, TResult> = {
    name: string;
    description?: string;
    schema: ArgsSchema<TArgs> | ZodLike<TArgs> | JSONSchema7;
    component: React.ComponentType<GenUIComponentProps<TArgs, TResult>>;
    loading?: React.ComponentType<GenUILoadingProps>;
    error?: React.ComponentType<GenUIErrorProps>;
};

/** Create an empty registry. Mirrors `createMessageRendererRegistry`. */
export function createGenUIToolRegistry(): GenUIToolRegistry {
    return {};
}

/**
 * Register a single tool. Returns the same registry instance for chaining.
 *
 * The schema is normalized once at registration so per-render validation is cheap.
 * Re-registering the same `name` overwrites the previous entry.
 */
export function registerGenUITool<TArgs, TResult>(
    registry: GenUIToolRegistry,
    definition: GenUIToolDefinition<TArgs, TResult>,
): GenUIToolRegistry {
    const normalized: GenUITool<TArgs, TResult> = {
        name: definition.name,
        description: definition.description,
        schema: normalizeSchema<TArgs>(definition.schema as ArgsSchema<TArgs>),
        component: definition.component,
        loading: definition.loading,
        error: definition.error,
    };
    Object.assign(registry, {[definition.name]: normalized});
    return registry;
}

/**
 * Shallow-merge any number of registries into a new registry. Later entries
 * take precedence — same conflict policy as `mergeMessageRendererRegistries`.
 */
export function mergeGenUIToolRegistries(...registries: GenUIToolRegistry[]): GenUIToolRegistry {
    return Object.assign({}, ...registries);
}

/** Lookup a tool by name. Returns `undefined` for unknown names (F3). */
export function getGenUITool(registry: GenUIToolRegistry, name: string): GenUITool | undefined {
    return registry[name];
}
