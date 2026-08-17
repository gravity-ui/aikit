import {getControlIconSize, resolveMobileControlSize} from '../useMobileControlSize';

describe('resolveMobileControlSize', () => {
    it('should keep an explicit size in both modes', () => {
        expect(
            resolveMobileControlSize({
                size: 'm',
                desktopDefault: 'l',
                mobileDefault: 'xl',
                isMobile: true,
            }),
        ).toBe('m');
        expect(
            resolveMobileControlSize({
                size: 'm',
                desktopDefault: 'l',
                mobileDefault: 'xl',
                isMobile: false,
            }),
        ).toBe('m');
    });

    it('should fall back to the mobile default in mobile mode', () => {
        expect(
            resolveMobileControlSize({
                size: undefined,
                desktopDefault: 'm',
                mobileDefault: 'xl',
                isMobile: true,
            }),
        ).toBe('xl');
    });

    it('should fall back to the desktop default outside mobile mode', () => {
        expect(
            resolveMobileControlSize({
                size: undefined,
                desktopDefault: 'm',
                mobileDefault: 'xl',
                isMobile: false,
            }),
        ).toBe('m');
    });
});

describe('getControlIconSize', () => {
    it('should return 20 for xl controls', () => {
        expect(getControlIconSize('xl')).toBe(20);
    });

    it('should return 16 for other sizes', () => {
        expect(getControlIconSize('m')).toBe(16);
        expect(getControlIconSize(undefined)).toBe(16);
    });
});
