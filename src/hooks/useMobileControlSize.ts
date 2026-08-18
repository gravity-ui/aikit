import {useMobile} from '@gravity-ui/uikit';

export type ControlSize = 'xs' | 's' | 'm' | 'l' | 'xl';

/**
 * Resolves a control size: an explicit size always wins, otherwise the mobile
 * default is used in mobile mode and the desktop default elsewhere.
 */
export function resolveMobileControlSize<T extends ControlSize>(params: {
    size: T | undefined;
    desktopDefault: T;
    mobileDefault: T;
    isMobile: boolean;
}): T {
    const {size, desktopDefault, mobileDefault, isMobile} = params;

    return size ?? (isMobile ? mobileDefault : desktopDefault);
}

/**
 * Mobile-aware control size, driven by the uikit `MobileProvider` context.
 */
export function useMobileControlSize<T extends ControlSize>(
    size: T | undefined,
    desktopDefault: T,
    mobileDefault: T,
): T {
    const isMobile = useMobile();

    return resolveMobileControlSize({size, desktopDefault, mobileDefault, isMobile});
}

/**
 * Icon size matching the resolved control size.
 */
export function getControlIconSize(size: ControlSize | undefined): number {
    return size === 'xl' ? 20 : 16;
}
