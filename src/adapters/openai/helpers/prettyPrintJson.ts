/**
 * Pretty-print a string that may contain JSON. Falls back to the original string
 * if it doesn't parse as JSON, so non-JSON payloads render unchanged.
 */
export function prettyPrintJson(s: string | undefined): string | undefined {
    if (!s) return undefined;
    try {
        return JSON.stringify(JSON.parse(s), null, 2);
    } catch {
        return s;
    }
}
