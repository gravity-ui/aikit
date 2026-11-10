export function cn(...values: unknown[]): string {
    return values
        .flatMap((value) => {
            if (typeof value === 'string') {
                return [value];
            }
            if (value && typeof value === 'object') {
                return Object.entries(value)
                    .filter(([, on]) => on)
                    .map(([key]) => key);
            }
            return [];
        })
        .join(' ');
}
