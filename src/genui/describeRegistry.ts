import type {JSONSchema7} from 'json-schema';

import type {GenUIToolRegistry} from './types';

export type GenUIToolCatalogEntry = {
    name: string;
    description?: string;
    /** May be `undefined` when a Zod schema lacks a JSON Schema converter. */
    parameters?: JSONSchema7;
};

export type GenUIToolCatalog = {
    tools: GenUIToolCatalogEntry[];
};

/**
 * Produce a JSON-Schema catalog of the registered tools, suitable for sending
 * to a model's tools API or rendering a debug panel.
 *
 * Zod schemas without a JSON Schema converter (older Zod) emit an entry with
 * no `parameters` field — consumers can provide a JSON Schema override at
 * registration time if they need full fidelity.
 */
export function describeGenUIRegistry(registry: GenUIToolRegistry): GenUIToolCatalog {
    return {
        tools: Object.values(registry).map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.schema.toJSONSchema(),
        })),
    };
}
