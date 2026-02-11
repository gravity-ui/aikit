/**
 * Checks whether the event is *.done (full text) rather than a delta.
 * For .done we must not return text since it is already accumulated from deltas; otherwise text would be duplicated.
 *
 * @param e - Event object
 * @param data - Optional data payload from event
 * @returns {boolean} True if event is output_text.done or content_part.done
 */
export function isOutputTextOrContentPartDone(
    e: Record<string, unknown>,
    data: Record<string, unknown> | undefined,
): boolean {
    return (
        e.type === 'response.output_text.done' ||
        e.type === 'response.content_part.done' ||
        e.event === 'response.output_text.done' ||
        e.event === 'response.content_part.done' ||
        data?.type === 'response.output_text.done' ||
        data?.type === 'response.content_part.done'
    );
}
