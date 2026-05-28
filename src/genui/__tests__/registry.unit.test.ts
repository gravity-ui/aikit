import {
    createGenUIToolRegistry,
    getGenUITool,
    mergeGenUIToolRegistries,
    registerGenUITool,
} from '../registry';
import type {GenUIComponentProps} from '../types';

const noopComponent = (_props: GenUIComponentProps<unknown, unknown>) => null;

describe('GenUI registry', () => {
    it('creates an empty registry', () => {
        const registry = createGenUIToolRegistry();
        expect(registry).toEqual({});
    });

    it('registers a tool with a JSON Schema and looks it up by name', () => {
        const registry = registerGenUITool(createGenUIToolRegistry(), {
            name: 'getWeather',
            description: 'Fetch the current weather',
            schema: {
                type: 'object',
                properties: {city: {type: 'string'}},
                required: ['city'],
                additionalProperties: false,
            },
            component: noopComponent,
        });

        const tool = getGenUITool(registry, 'getWeather');
        expect(tool).toBeDefined();
        expect(tool?.name).toBe('getWeather');
        expect(tool?.schema.kind).toBe('json-schema');
    });

    it('returns undefined for unknown tool names', () => {
        const registry = createGenUIToolRegistry();
        expect(getGenUITool(registry, 'missing')).toBeUndefined();
    });

    it('re-registration overwrites the previous entry', () => {
        const registry = createGenUIToolRegistry();
        registerGenUITool(registry, {
            name: 'a',
            schema: {type: 'object'},
            component: noopComponent,
            description: 'first',
        });
        registerGenUITool(registry, {
            name: 'a',
            schema: {type: 'object'},
            component: noopComponent,
            description: 'second',
        });
        expect(getGenUITool(registry, 'a')?.description).toBe('second');
    });

    it('merges multiple registries with later entries winning', () => {
        const base = createGenUIToolRegistry();
        registerGenUITool(base, {
            name: 'shared',
            description: 'base',
            schema: {type: 'object'},
            component: noopComponent,
        });
        registerGenUITool(base, {
            name: 'only-base',
            schema: {type: 'object'},
            component: noopComponent,
        });

        const override = createGenUIToolRegistry();
        registerGenUITool(override, {
            name: 'shared',
            description: 'override',
            schema: {type: 'object'},
            component: noopComponent,
        });
        registerGenUITool(override, {
            name: 'only-override',
            schema: {type: 'object'},
            component: noopComponent,
        });

        const merged = mergeGenUIToolRegistries(base, override);
        expect(getGenUITool(merged, 'shared')?.description).toBe('override');
        expect(getGenUITool(merged, 'only-base')).toBeDefined();
        expect(getGenUITool(merged, 'only-override')).toBeDefined();
    });
});
