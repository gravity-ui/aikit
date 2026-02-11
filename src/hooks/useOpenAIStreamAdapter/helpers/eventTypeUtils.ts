type EventRecord = Record<string, unknown>;

export function isEventOneOf(
    e: EventRecord,
    data: EventRecord | undefined,
    types: string[],
): boolean {
    const t = e.type as string | undefined;
    const ev = e.event as string | undefined;
    const dt = data?.type as string | undefined;
    return types.some((type) => t === type || ev === type || dt === type);
}

export function getDeltaForEventTypes(
    e: EventRecord,
    data: EventRecord | undefined,
    eventTypes: string[],
): string | null {
    if (eventTypes.includes((e.type as string) ?? '') && typeof e.delta === 'string') {
        return e.delta;
    }
    if (!isEventOneOf(e, data, eventTypes)) {
        return null;
    }
    const delta = (data?.delta ?? e.delta) as string | undefined;
    return typeof delta === 'string' ? delta : null;
}
