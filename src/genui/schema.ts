import Ajv, {type ValidateFunction} from 'ajv';
import type {JSONSchema7} from 'json-schema';

import type {GenUIError} from './types';

/** @internal — types-only import; Zod is an optional peer. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodLike<T = any> = {
    readonly _def?: unknown;
    safeParse: (
        input: unknown,
    ) => {success: true; data: T} | {success: false; error: {issues: unknown[]; message: string}};
};

export type SchemaSuccess<T> = {success: true; data: T};
export type SchemaFailure = {success: false; error: GenUIError};
export type SchemaResult<T> = SchemaSuccess<T> | SchemaFailure;

/**
 * Normalized validator wrapping either a Zod schema (compiled at construction)
 * or a JSON Schema (compiled lazily by AJV and cached on the object).
 */
export type ArgsSchema<T = unknown> =
    | {
          kind: 'zod';
          schema: ZodLike<T>;
          validate: (input: unknown) => SchemaResult<T>;
          toJSONSchema: () => JSONSchema7 | undefined;
      }
    | {
          kind: 'json-schema';
          schema: JSONSchema7;
          validate: (input: unknown) => SchemaResult<T>;
          toJSONSchema: () => JSONSchema7;
      };

/**
 * Singleton AJV instance — re-used so compile caches are shared across tools.
 * `strict: false` to be tolerant of authoring conventions; we don't run AJV
 * against arbitrary attacker input, only model output.
 */
const ajv = new Ajv({strict: false, allErrors: true});

/** @internal — duck-typed Zod detection (avoids a hard dep). */
function isZodSchema(value: unknown): value is ZodLike {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as {safeParse?: unknown}).safeParse === 'function'
    );
}

function isAlreadyNormalized<T>(value: unknown): value is ArgsSchema<T> {
    return (
        typeof value === 'object' &&
        value !== null &&
        'validate' in (value as Record<string, unknown>) &&
        'kind' in (value as Record<string, unknown>)
    );
}

/**
 * Wrap a JSON Schema → ArgsSchema. The AJV `ValidateFunction` is created once
 * and reused for every call (PF2).
 */
function fromJSONSchema<T>(schema: JSONSchema7): ArgsSchema<T> {
    let compiled: ValidateFunction<T> | undefined;
    const compile = (): ValidateFunction<T> => {
        if (!compiled) {
            compiled = ajv.compile<T>(schema);
        }
        return compiled;
    };
    return {
        kind: 'json-schema',
        schema,
        toJSONSchema: () => schema,
        validate: (input: unknown): SchemaResult<T> => {
            const fn = compile();
            if (fn(input)) {
                return {success: true, data: input as T};
            }
            return {
                success: false,
                error: {
                    code: 'schema-validation',
                    message: ajv.errorsText(fn.errors, {separator: '; '}) || 'Invalid arguments',
                    cause: fn.errors,
                },
            };
        },
    };
}

/**
 * Wrap a Zod schema → ArgsSchema. The Zod object itself is the compiled
 * validator, so we just hold a reference and call `safeParse` on each input.
 *
 * Conversion to JSON Schema is best-effort: newer Zod ships `z.toJSONSchema`
 * (or `schema.toJSONSchema()` on instances). If neither is available we return
 * `undefined`; consumers can still register the catalog manually.
 */
function fromZod<T>(schema: ZodLike<T>): ArgsSchema<T> {
    return {
        kind: 'zod',
        schema,
        toJSONSchema: () => zodToJSONSchema(schema),
        validate: (input: unknown): SchemaResult<T> => {
            const result = schema.safeParse(input);
            if (result.success) {
                return {success: true, data: result.data};
            }
            return {
                success: false,
                error: {
                    code: 'schema-validation',
                    message: result.error.message || 'Invalid arguments',
                    cause: result.error.issues,
                },
            };
        },
    };
}

function zodToJSONSchema(schema: ZodLike): JSONSchema7 | undefined {
    const maybeInstance = schema as unknown as {toJSONSchema?: () => JSONSchema7};
    if (typeof maybeInstance.toJSONSchema === 'function') {
        try {
            return maybeInstance.toJSONSchema();
        } catch {
            return undefined;
        }
    }
    return undefined;
}

/**
 * Accepts a Zod schema, a JSON Schema, or an already-normalized {@link ArgsSchema}
 * and returns the normalized form. Idempotent.
 */
export function normalizeSchema<T>(
    schema: ZodLike<T> | JSONSchema7 | ArgsSchema<T>,
): ArgsSchema<T> {
    if (isAlreadyNormalized<T>(schema)) {
        return schema;
    }
    if (isZodSchema(schema)) {
        return fromZod<T>(schema as ZodLike<T>);
    }
    return fromJSONSchema<T>(schema as JSONSchema7);
}

/**
 * Validate `input` against a normalized schema. Pass-through helper kept for
 * symmetry with the existing `messageTypeRegistry` API.
 */
export function validateArgs<T>(schema: ArgsSchema<T>, input: unknown): SchemaResult<T> {
    return schema.validate(input);
}
