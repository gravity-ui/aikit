const CIRCULAR_REF = '[Circular]';

function indentLines(text: string, spaces: number): string {
    const prefix = ' '.repeat(spaces);
    return text
        .split('\n')
        .map((line) => `${prefix}${line}`)
        .join('\n');
}

function isComplexValue(val: unknown): boolean {
    if (val === null || val === undefined) {
        return false;
    }
    if (Array.isArray(val)) {
        return val.length > 0;
    }
    if (typeof val === 'object') {
        return Object.keys(val).length > 0;
    }
    if (typeof val === 'string') {
        return val.includes('\n');
    }
    return false;
}

function withVisitedObject<T extends object>(
    value: T,
    visited: Set<object>,
    serialize: () => string,
): string {
    if (visited.has(value)) {
        return CIRCULAR_REF;
    }
    visited.add(value);
    try {
        return serialize();
    } finally {
        visited.delete(value);
    }
}

function isVisitedReference(val: unknown, visited: Set<object>): val is object {
    return typeof val === 'object' && val !== null && visited.has(val);
}

function formatKeyValue(
    key: string,
    val: unknown,
    keyPrefix: string,
    indent: number,
    visited: Set<object>,
): string {
    if (isVisitedReference(val, visited)) {
        return `${keyPrefix}${key}: ${CIRCULAR_REF}`;
    }
    if (isComplexValue(val)) {
        return `${keyPrefix}${key}:\n${toYamlLikeInternal(val, indent + 2, visited)}`;
    }
    return `${keyPrefix}${key}: ${toYamlLikeInternal(val, indent + 2, visited)}`;
}

/**
 * Simple YAML-like serializer for plain JS values.
 * Handles: string, number, boolean, null/undefined, arrays, plain objects.
 * Falls back to String() for unsupported types.
 * Internal helper — not exported from the package.
 */
export function toYamlLike(data: unknown, indent = 0): string {
    return toYamlLikeInternal(data, indent, new Set());
}

function toYamlLikeInternal(data: unknown, indent: number, visited: Set<object>): string {
    if (data === null || data === undefined) return 'null';

    if (typeof data === 'string') {
        if (data.includes('\n')) {
            return `|\n${indentLines(data, indent + 2)}`;
        }
        return data;
    }

    if (typeof data === 'number' || typeof data === 'boolean') {
        return String(data);
    }

    if (Array.isArray(data)) {
        if (data.length === 0) return '[]';

        return withVisitedObject(data, visited, () =>
            data
                .map((item) => {
                    const prefix = `${' '.repeat(indent)}- `;
                    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                        return withVisitedObject(item, visited, () => {
                            const entries = Object.entries(item);
                            if (entries.length === 0) return `${prefix}{}`;
                            const [firstKey, firstVal] = entries[0];
                            const firstLine = formatKeyValue(
                                firstKey,
                                firstVal,
                                `${' '.repeat(indent)}- `,
                                indent,
                                visited,
                            );
                            const rest = entries
                                .slice(1)
                                .map(([key, val]) =>
                                    formatKeyValue(
                                        key,
                                        val,
                                        ' '.repeat(indent + 2),
                                        indent + 2,
                                        visited,
                                    ),
                                )
                                .join('\n');
                            return rest ? `${firstLine}\n${rest}` : firstLine;
                        });
                    }
                    return `${prefix}${toYamlLikeInternal(item, indent + 2, visited)}`;
                })
                .join('\n'),
        );
    }

    if (typeof data === 'object') {
        return withVisitedObject(data, visited, () => {
            const entries = Object.entries(data as Record<string, unknown>);
            if (entries.length === 0) return '{}';

            return entries
                .map(([key, val]) => formatKeyValue(key, val, ' '.repeat(indent), indent, visited))
                .join('\n');
        });
    }

    return String(data);
}
