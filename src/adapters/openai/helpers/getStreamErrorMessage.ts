export function getStreamErrorMessage(event: Record<string, unknown>): string {
    if (typeof event.error === 'string') return event.error;
    const dataError = (event.data as {error?: string})?.error;
    if (dataError) return dataError;
    const message = (event.error as {message?: string})?.message;
    if (message) return message;
    return 'Stream error';
}
