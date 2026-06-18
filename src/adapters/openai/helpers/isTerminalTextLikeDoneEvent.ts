import {isEventOneOf} from './eventTypeUtils';

const TERMINAL_TEXT_LIKE_DONE_EVENT_TYPES = [
    'response.output_text.done',
    'response.content_part.done',
    'response.refusal.done',
    'response.reasoning_text.done',
    'response.reasoning_summary_text.done',
];

/** *.done (full text) — don't return as delta to avoid duplicating accumulated text. */

export function isTerminalTextLikeDoneEvent(
    e: Record<string, unknown>,
    data: Record<string, unknown> | undefined,
): boolean {
    return isEventOneOf(e, data, TERMINAL_TEXT_LIKE_DONE_EVENT_TYPES);
}
