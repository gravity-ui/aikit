export function getStreamErrorMessage(event: Record<string, unknown>): string {
    if (typeof event.error === 'string') {
        return event.error;
    }
    const message = (event.error as {message?: string})?.message;
    if (message) {
        return message;
    }
    if (typeof event.message === 'string') {
        return event.message;
    }
    const data = event.data as {error?: string | {message?: string}; message?: string} | undefined;
    if (typeof data?.error === 'string') {
        return data.error;
    }
    if (typeof data?.error?.message === 'string') {
        return data.error.message;
    }
    if (typeof data?.message === 'string') {
        return data.message;
    }
    return 'Stream error';
}
