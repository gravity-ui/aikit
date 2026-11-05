export function cn(...values: unknown[]): string {
    return values
        .flatMap((value) => {
            if (typeof value === 'string') return [value];
            if (value && typeof value === 'object')
                return Object.entries(value)
                    .filter(([, on]) => on)
                    .map(([key]) => key);
            return [];
        })
        .join(' ');
}
export const intl = {
    createMessages: (messages: Record<string, {en: string; ru: string; meta?: unknown}>) => ({
        t: (key: string, _params?: unknown) =>
            messages[key]?.[document.documentElement.lang === 'ru' ? 'ru' : 'en'] || key,
    }),
};
export const i18n = (key: string, _params?: unknown) =>
    ({search: 'Search', 'nothing-found': 'Nothing found', 'items-found': 'Items found'})[
        key as 'search'
    ] || key;
