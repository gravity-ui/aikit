import type {TMessageContent} from '../../../../../types';

/** Single bar of the `chart` message type. */
export interface ChartBar {
    /** Label shown under the bar */
    label: string;
    /** Raw value; bar height is scaled relative to the largest value */
    value: number;
    /** Optional bar color (defaults to the brand color) */
    color?: string;
}

/** Data payload for the `chart` custom message type. */
export interface ChartMessageData {
    /** Optional chart heading */
    title?: string;
    /** Bars to render */
    bars: ChartBar[];
}

export type ChartMessageContent = TMessageContent<'chart', ChartMessageData>;
