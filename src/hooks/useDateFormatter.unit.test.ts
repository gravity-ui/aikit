import dayjs from 'dayjs';

import {getFormattedDate, getFormattedTime} from './useDateFormatter';

describe('getFormattedDate', () => {
    const testDate = dayjs('2024-03-15T14:30:45');

    describe('without custom format', () => {
        it('should return default format YYYY.MM.DD', () => {
            const result = getFormattedDate(testDate);
            expect(result).toBe('2024.03.15');
        });

        it('should handle undefined format parameter', () => {
            const result = getFormattedDate(testDate, undefined);
            expect(result).toBe('2024.03.15');
        });
    });

    describe('with custom format', () => {
        it('should extract date part from combined date-time format', () => {
            const result = getFormattedDate(testDate, 'YYYY-MM-DD HH:mm');
            expect(result).toBe('2024-03-15');
        });

        it('should extract date part and ignore time tokens (HH:mm)', () => {
            const result = getFormattedDate(testDate, 'DD/MM/YYYY HH:mm');
            expect(result).toBe('15/03/2024');
        });

        it('should handle single H time token', () => {
            const result = getFormattedDate(testDate, 'YYYY.MM.DD H:mm');
            expect(result).toBe('2024.03.15');
        });

        it('should handle hh time token (12-hour format)', () => {
            const result = getFormattedDate(testDate, 'MM-DD-YYYY hh:mm A');
            expect(result).toBe('03-15-2024');
        });

        it('should handle h time token (12-hour format)', () => {
            const result = getFormattedDate(testDate, 'DD.MM.YY h:mm a');
            expect(result).toBe('15.03.24');
        });

        it('should handle ss (seconds) token', () => {
            const result = getFormattedDate(testDate, 'YYYY/MM/DD HH:mm:ss');
            expect(result).toBe('2024/03/15');
        });

        it('should handle timezone tokens (Z)', () => {
            const result = getFormattedDate(testDate, 'YYYY-MM-DD HH:mm Z');
            expect(result).toBe('2024-03-15');
        });

        it('should handle timezone tokens (z)', () => {
            const result = getFormattedDate(testDate, 'YYYY-MM-DD HH:mm z');
            expect(result).toBe('2024-03-15');
        });

        it('should handle A (uppercase AM/PM) token', () => {
            const result = getFormattedDate(testDate, 'DD-MM-YYYY hh:mm A');
            expect(result).toBe('15-03-2024');
        });

        it('should handle a (lowercase am/pm) token', () => {
            const result = getFormattedDate(testDate, 'DD-MM-YYYY hh:mm a');
            expect(result).toBe('15-03-2024');
        });

        it('should fall back to default format if only time tokens provided', () => {
            const result = getFormattedDate(testDate, 'HH:mm:ss');
            expect(result).toBe('2024.03.15');
        });

        it('should handle date-only format without time', () => {
            const result = getFormattedDate(testDate, 'DD/MM/YYYY');
            expect(result).toBe('15/03/2024');
        });

        it('should handle format with different separators', () => {
            const result = getFormattedDate(testDate, 'YYYY-MM-DD HH~mm');
            expect(result).toBe('2024-03-15');
        });

        it('should handle format with dot separator', () => {
            const result = getFormattedDate(testDate, 'DD.MM.YYYY HH.mm');
            expect(result).toBe('15.03.2024');
        });

        it('should handle format with slash separator', () => {
            const result = getFormattedDate(testDate, 'MM/DD/YY HH/mm');
            expect(result).toBe('03/15/24');
        });

        it('should handle complex format with multiple time components', () => {
            const result = getFormattedDate(testDate, 'YYYY-MM-DD HH:mm:ss A Z');
            expect(result).toBe('2024-03-15');
        });
    });

    describe('with different date values', () => {
        it('should format single digit day and month correctly', () => {
            const singleDigitDate = dayjs('2024-01-05T10:30:00');
            const result = getFormattedDate(singleDigitDate, 'DD/MM/YYYY');
            expect(result).toBe('05/01/2024');
        });

        it('should format year with YY token', () => {
            const result = getFormattedDate(testDate, 'DD-MM-YY');
            expect(result).toBe('15-03-24');
        });

        it('should format month with MMM token', () => {
            const result = getFormattedDate(testDate, 'DD MMM YYYY');
            expect(result).toBe('15 Mar 2024');
        });

        it('should format month with MMMM token', () => {
            const result = getFormattedDate(testDate, 'DD MMMM YYYY');
            expect(result).toBe('15 March 2024');
        });
    });
});

describe('getFormattedTime', () => {
    const testDate = dayjs('2024-03-15T14:30:45');

    describe('without custom format', () => {
        it('should return default format HH:mm', () => {
            const result = getFormattedTime(testDate);
            expect(result).toBe('14:30');
        });

        it('should handle undefined format parameter', () => {
            const result = getFormattedTime(testDate, undefined);
            expect(result).toBe('14:30');
        });
    });

    describe('with custom format', () => {
        it('should extract time part from combined date-time format', () => {
            const result = getFormattedTime(testDate, 'YYYY-MM-DD HH:mm');
            expect(result).toBe('14:30');
        });

        it('should extract time part with seconds', () => {
            const result = getFormattedTime(testDate, 'DD/MM/YYYY HH:mm:ss');
            expect(result).toBe('14:30:45');
        });

        it('should handle 12-hour format with AM/PM (uppercase)', () => {
            const result = getFormattedTime(testDate, 'YYYY-MM-DD hh:mm A');
            expect(result).toBe('02:30 PM');
        });

        it('should handle 12-hour format with am/pm (lowercase)', () => {
            const result = getFormattedTime(testDate, 'YYYY-MM-DD hh:mm a');
            expect(result).toBe('02:30 pm');
        });

        it('should handle single h token (12-hour format)', () => {
            const result = getFormattedTime(testDate, 'DD.MM.YYYY h:mm a');
            expect(result).toBe('2:30 pm');
        });

        it('should handle single H token (24-hour format)', () => {
            const result = getFormattedTime(testDate, 'DD.MM.YYYY H:mm');
            expect(result).toBe('14:30');
        });

        it('should handle timezone token Z', () => {
            const result = getFormattedTime(testDate, 'YYYY-MM-DD HH:mm Z');
            expect(result).toMatch(/14:30 [+-]\d{2}:\d{2}/);
        });

        it('should handle timezone token z', () => {
            const result = getFormattedTime(testDate, 'YYYY-MM-DD HH:mm z');
            // Result depends on the timezone, just check it contains the time
            expect(result).toContain('14:30');
        });

        it('should handle time-only format', () => {
            const result = getFormattedTime(testDate, 'HH:mm:ss');
            expect(result).toBe('14:30:45');
        });

        it('should handle time with different separators (dot)', () => {
            const result = getFormattedTime(testDate, 'YYYY-MM-DD HH.mm');
            expect(result).toBe('14.30');
        });

        it('should handle time with different separators (dash)', () => {
            const result = getFormattedTime(testDate, 'DD/MM/YYYY HH-mm');
            expect(result).toBe('14-30');
        });

        it('should handle time with different separators (tilde)', () => {
            const result = getFormattedTime(testDate, 'YYYY.MM.DD HH~mm');
            expect(result).toBe('14~30');
        });

        it('should handle time with different separators (slash)', () => {
            const result = getFormattedTime(testDate, 'DD-MM-YYYY HH/mm');
            expect(result).toBe('14/30');
        });

        it('should handle time with backslash separator', () => {
            const result = getFormattedTime(testDate, 'DD-MM-YYYY HH\\mm');
            // Dayjs treats backslash as escape character
            expect(result).toContain('14');
        });

        it('should fall back to default format if no time tokens found', () => {
            const result = getFormattedTime(testDate, 'YYYY-MM-DD');
            expect(result).toBe('14:30');
        });
    });

    describe('with different time values', () => {
        it('should format morning time (AM)', () => {
            const morningDate = dayjs('2024-03-15T09:15:30');
            const result = getFormattedTime(morningDate, 'DD/MM/YYYY hh:mm A');
            expect(result).toBe('09:15 AM');
        });

        it('should format midnight correctly', () => {
            const midnightDate = dayjs('2024-03-15T00:00:00');
            const result = getFormattedTime(midnightDate, 'HH:mm:ss');
            expect(result).toBe('00:00:00');
        });

        it('should format noon correctly', () => {
            const noonDate = dayjs('2024-03-15T12:00:00');
            const result = getFormattedTime(noonDate, 'hh:mm A');
            expect(result).toBe('12:00 PM');
        });

        it('should format single digit hours and minutes', () => {
            const singleDigitTime = dayjs('2024-03-15T05:05:05');
            const result = getFormattedTime(singleDigitTime, 'HH:mm:ss');
            expect(result).toBe('05:05:05');
        });

        it('should format single digit hours with H token', () => {
            const singleDigitTime = dayjs('2024-03-15T05:05:05');
            const result = getFormattedTime(singleDigitTime, 'H:mm');
            expect(result).toBe('5:05');
        });

        it('should format late evening time', () => {
            const eveningDate = dayjs('2024-03-15T23:59:59');
            const result = getFormattedTime(eveningDate, 'HH:mm:ss');
            expect(result).toBe('23:59:59');
        });

        it('should format late evening time in 12-hour format', () => {
            const eveningDate = dayjs('2024-03-15T23:59:59');
            const result = getFormattedTime(eveningDate, 'hh:mm:ss a');
            expect(result).toBe('11:59:59 pm');
        });
    });

    describe('edge cases', () => {
        it('should handle format with only date tokens by falling back to default', () => {
            const result = getFormattedTime(testDate, 'YYYY-MM-DD');
            expect(result).toBe('14:30');
        });

        it('should handle empty string format', () => {
            const result = getFormattedTime(testDate, '');
            expect(result).toBe('14:30');
        });

        it('should handle complex format with multiple components', () => {
            const result = getFormattedTime(testDate, 'YYYY-MM-DD HH:mm:ss A Z');
            expect(result).toMatch(/14:30:45 PM [+-]\d{2}:\d{2}/);
        });
    });
});
