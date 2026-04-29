function indentLines(text: string, spaces: number): string {
    const prefix = ' '.repeat(spaces);
    return text
        .split('\n')
        .map((line) => `${prefix}${line}`)
        .join('\n');
}

/**
 * Simple YAML-like serializer for plain JS values.
 * Handles: string, number, boolean, null/undefined, arrays, plain objects.
 * Falls back to String() for unsupported types.
 * Internal helper — not exported from the package.
 */
export function toYamlLike(data: unknown, indent = 0): string {
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

        return data
            .map((item) => {
                const prefix = `${' '.repeat(indent)}- `;
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    const entries = Object.entries(item);
                    if (entries.length === 0) return `${prefix}{}`;
                    const [firstKey, firstVal] = entries[0];
                    const firstLine = `${prefix}${firstKey}: ${toYamlLike(firstVal, indent + 2)}`;
                    const rest = entries
                        .slice(1)
                        .map(
                            ([key, val]) =>
                                `${' '.repeat(indent + 2)}${key}: ${toYamlLike(val, indent + 2)}`,
                        )
                        .join('\n');
                    return rest ? `${firstLine}\n${rest}` : firstLine;
                }
                return `${prefix}${toYamlLike(item, indent + 2)}`;
            })
            .join('\n');
    }

    if (typeof data === 'object') {
        const entries = Object.entries(data as Record<string, unknown>);
        if (entries.length === 0) return '{}';

        return entries
            .map(([key, val]) => {
                const isComplex =
                    typeof val === 'object' && val !== null && Object.keys(val).length > 0;
                if (isComplex) {
                    return `${' '.repeat(indent)}${key}:\n${toYamlLike(val, indent + 2)}`;
                }
                return `${' '.repeat(indent)}${key}: ${toYamlLike(val, indent + 2)}`;
            })
            .join('\n');
    }

    return String(data);
}
