import type {JSONSchema7} from 'json-schema';

import {normalizeSchema, validateArgs} from '../schema';

describe('GenUI schema adapter', () => {
    describe('JSON Schema path', () => {
        const schemaObj: JSONSchema7 = {
            type: 'object',
            properties: {
                city: {type: 'string'},
                units: {type: 'string', enum: ['c', 'f']},
            },
            required: ['city'],
            additionalProperties: false,
        };

        it('normalizes a JSON Schema and validates a matching payload', () => {
            const schema = normalizeSchema<{city: string; units?: 'c' | 'f'}>(schemaObj);
            expect(schema.kind).toBe('json-schema');

            const result = validateArgs(schema, {city: 'Berlin', units: 'c'});
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({city: 'Berlin', units: 'c'});
            }
        });

        it('rejects an invalid payload with a schema-validation error', () => {
            const schema = normalizeSchema(schemaObj);
            const result = validateArgs(schema, {units: 'k'});
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe('schema-validation');
                expect(typeof result.error.message).toBe('string');
            }
        });

        it('exposes the original schema via toJSONSchema', () => {
            const schema = normalizeSchema(schemaObj);
            expect(schema.toJSONSchema()).toEqual(schemaObj);
        });

        it('is idempotent — re-normalizing an ArgsSchema yields the same shape', () => {
            const schema = normalizeSchema(schemaObj);
            const again = normalizeSchema(schema);
            expect(again).toBe(schema);
        });
    });

    describe('Zod-like duck-typed path', () => {
        // Minimal Zod-shaped object — keeps the test free of a real zod dep.
        function makeZodLike() {
            return {
                _def: {tag: 'object'},
                safeParse(input: unknown) {
                    if (
                        typeof input === 'object' &&
                        input !== null &&
                        typeof (input as {city?: unknown}).city === 'string'
                    ) {
                        return {success: true as const, data: input as {city: string}};
                    }
                    return {
                        success: false as const,
                        error: {issues: [{path: ['city']}], message: 'city must be a string'},
                    };
                },
            };
        }

        it('detects a Zod-shaped schema and validates a matching payload', () => {
            const schema = normalizeSchema<{city: string}>(makeZodLike());
            expect(schema.kind).toBe('zod');

            const result = validateArgs(schema, {city: 'Berlin'});
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({city: 'Berlin'});
            }
        });

        it('surfaces a schema-validation error on failure', () => {
            const schema = normalizeSchema(makeZodLike());
            const result = validateArgs(schema, {city: 42});
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe('schema-validation');
                expect(result.error.message).toContain('city');
            }
        });

        it('returns undefined from toJSONSchema when Zod has no converter', () => {
            const schema = normalizeSchema(makeZodLike());
            expect(schema.toJSONSchema()).toBeUndefined();
        });
    });
});
