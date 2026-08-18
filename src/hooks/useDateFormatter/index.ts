import {useMemo} from 'react';

import dayjs, {Dayjs} from 'dayjs';

import {RELATIVE_DATE_THRESHOLD} from '../../constants';

export type DateLocaleConfig = Exclude<Parameters<Dayjs['locale']>[0], string>;

export interface UseDateFormatterOptions {
    date: string | Date | number;
    format?: string;
    locale?: string;
    localeConfig?: DateLocaleConfig;
}

export interface UseDateFormatterResult {
    formattedDate: string;
    formattedTime: string;
    fullDate: string;
    dateObject: Dayjs | null;
    isValid: boolean;
    diffDays: number | null;
}

/**
 * Gets the full date string for title attribute
 * @param dateObject - Dayjs date object
 * @returns Full formatted date string
 */
function getFullDate(dateObject: Dayjs, locale?: string): string {
    if (!dateObject.isValid()) {
        return '';
    }

    try {
        return new Intl.DateTimeFormat(locale, {
            dateStyle: 'full',
            timeStyle: 'short',
        }).format(dateObject.toDate());
    } catch {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'full',
            timeStyle: 'short',
        }).format(dateObject.toDate());
    }
}

function applyLocale(dateObject: Dayjs, locale?: string, localeConfig?: DateLocaleConfig): Dayjs {
    if (localeConfig) {
        return dateObject.locale(localeConfig);
    }

    const language = locale?.toLowerCase().split(/[-_]/)[0];
    return language ? dateObject.locale(language) : dateObject;
}

/**
 * Gets formatted date string based on format and relative flag
 * @param dateObject - Dayjs date object
 * @param format - Optional format string
 * @param relative - Whether to use relative date formatting
 * @returns Formatted date string
 */
export function getFormattedDate(
    dateObject: Dayjs,
    format?: string,
    locale?: string,
    localeConfig?: DateLocaleConfig,
): string {
    const localizedDateObject = applyLocale(dateObject, locale, localeConfig);

    if (!format) {
        return localizedDateObject.format('YYYY.MM.DD');
    }

    // Extract date part from custom format
    // Remove common time format tokens (HH, H, hh, h, mm, ss, A, a, etc.)
    const dateFormat = format.replace(/\s*(HH?|hh?|mm|ss|A|a|Z|z).*/g, '').trim();
    if (!dateFormat) {
        return '';
    }

    return localizedDateObject.format(dateFormat);
}

/**
 * Gets formatted time string based on format and relative flag
 * @param dateObject - Dayjs date object
 * @param format - Optional format string
 * @returns Formatted time string
 */
export function getFormattedTime(
    dateObject: Dayjs,
    format?: string,
    locale?: string,
    localeConfig?: DateLocaleConfig,
): string {
    const localizedDateObject = applyLocale(dateObject, locale, localeConfig);

    if (!format) {
        return localizedDateObject.format('HH:mm');
    }

    // Extract time part from custom format
    // Find the first time token and capture everything from there to the end
    // This handles formats like "HH:mm", "HH-mm", "HH.mm", "HH~mm", "HH/mm", "HH\mm", etc.
    // Time tokens: H, h (hours), m (minutes), s (seconds), A, a (AM/PM), Z, z (timezone)
    const timeMatch = format.match(/(.*?)(\s*[HhmsAaZz](?:[HhmsAaZz]|[^HhmsAaZz])*)$/);
    if (timeMatch && timeMatch[2]) {
        const timeFormat = timeMatch[2].trim();
        return localizedDateObject.format(timeFormat);
    }

    return localizedDateObject.format('HH:mm');
}

/**
 * Calculates the difference in days from today
 * @param dateObject - Dayjs date object
 * @returns Number of days difference
 */
function getDiffDays(dateObject: Dayjs): number | null {
    const now = dayjs();
    const today = now.startOf('day');
    const dateStart = dateObject.startOf('day');
    const diffDays = today.diff(dateStart, 'day');
    if (diffDays >= RELATIVE_DATE_THRESHOLD) {
        return null;
    }

    return today.diff(dateStart, 'day');
}

/**
 * Hook for formatting dates
 * @param options - Date formatting options
 * @returns Formatted date string, full date for title, and validation info
 */
export function useDateFormatter(options: UseDateFormatterOptions): UseDateFormatterResult {
    const {date, format, locale, localeConfig} = options;

    return useMemo(() => {
        const dateObject = dayjs(date);

        if (!dateObject.isValid()) {
            return {
                formattedDate: '',
                formattedTime: '',
                fullDate: '',
                dateObject: null,
                isValid: false,
                diffDays: null,
            };
        }

        return {
            fullDate: getFullDate(dateObject, locale),
            formattedDate: getFormattedDate(dateObject, format, locale, localeConfig),
            formattedTime: getFormattedTime(dateObject, format, locale, localeConfig),
            diffDays: getDiffDays(dateObject),
            isValid: dateObject.isValid(),
            dateObject: dateObject.isValid() ? dateObject : null,
        };
    }, [date, format, locale, localeConfig]);
}
