import {isEventOneOf} from './eventTypeUtils';

const OUTPUT_TEXT_OR_CONTENT_PART_DONE_TYPES = [
    'response.output_text.done',
    'response.content_part.done',
    'response.refusal.done',
];

/** *.done (full text) — don't return as delta to avoid duplicating accumulated text. */

export function isOutputTextOrContentPartDone(
    e: Record<string, unknown>,
    data: Record<string, unknown> | undefined,
): boolean {
    return isEventOneOf(e, data, OUTPUT_TEXT_OR_CONTENT_PART_DONE_TYPES);
}
