import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

import type {ChatScreenLeaveIntent, ChatScreenNavigationProps} from './screenTypes';

const EMPTY_SCREENS: NonNullable<ChatScreenNavigationProps['screens']> = [];

/** A root plus secondary screens; deliberately independent of browser history. */
export function useChatScreenNavigation({
    screens = EMPTY_SCREENS,
    activeScreen,
    defaultActiveScreen = 'chat',
    onScreenChange,
    onScreenNavigationError,
    onClose,
}: ChatScreenNavigationProps & {onClose?: () => void}) {
    const ids = new Set<string>(['chat']);
    for (const screen of screens) {
        if (!screen.id || ids.has(screen.id)) {
            throw new Error(`ChatContainer: duplicate or reserved screen ID "${screen.id}".`);
        }
        ids.add(screen.id);
    }

    const [internalScreen, setInternalScreen] = useState(defaultActiveScreen);
    const requested = activeScreen ?? internalScreen;
    const selected = screens.find((screen) => screen.id === requested && screen.enabled !== false);
    const current = selected?.id ?? 'chat';
    const [pending, setPending] = useState(false);
    const revision = useRef(0);
    const busy = useRef(false);
    const mounted = useRef(false);
    const previous = useRef(requested);
    const notifiedInvalid = useRef<string>();
    const latest = useRef({
        screens,
        selected,
        requested,
        current,
        activeScreen,
        onScreenChange,
        onScreenNavigationError,
        onClose,
    });
    useLayoutEffect(() => {
        latest.current = {
            screens,
            selected,
            requested,
            current,
            activeScreen,
            onScreenChange,
            onScreenNavigationError,
            onClose,
        };
        if (previous.current !== requested || (requested !== 'chat' && !selected)) {
            revision.current += 1;
            busy.current = false;
            setPending(false);
        }
        previous.current = requested;
    });
    useLayoutEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            revision.current += 1;
        };
    }, []);

    useEffect(() => {
        if (requested === 'chat' || selected) {
            notifiedInvalid.current = undefined;
            return;
        }
        if (notifiedInvalid.current === requested) {
            return;
        }
        notifiedInvalid.current = requested;
        if (activeScreen === undefined) {
            setInternalScreen('chat');
        }
        onScreenChange?.('chat', {previousScreen: requested, reason: 'unavailable'});
    }, [requested, selected, activeScreen, onScreenChange]);

    const request = useCallback(async (intent: ChatScreenLeaveIntent) => {
        const source = latest.current;
        const target = intent.nextScreen;
        const isAvailable = () =>
            target === 'chat' ||
            latest.current.screens.some(
                (screen) => screen.id === target && screen.enabled !== false,
            );
        if (
            busy.current ||
            (intent.action !== 'close' && (target === source.current || !isAvailable()))
        ) {
            return;
        }
        const token = ++revision.current;
        busy.current = true;
        setPending(true);
        try {
            const allowed = await (source.selected?.beforeLeave?.(intent) ?? true);
            if (
                !mounted.current ||
                token !== revision.current ||
                !allowed ||
                latest.current.current !== source.current
            ) {
                return;
            }
            if (intent.action === 'close') {
                latest.current.onClose?.();
            } else if (target && isAvailable()) {
                if (latest.current.activeScreen === undefined) {
                    setInternalScreen(target);
                }
                latest.current.onScreenChange?.(target, {
                    previousScreen: source.current,
                    reason: intent.action,
                });
            }
        } catch (error) {
            if (mounted.current && token === revision.current) {
                latest.current.onScreenNavigationError?.(error);
            }
        } finally {
            if (mounted.current && token === revision.current) {
                busy.current = false;
                setPending(false);
            }
        }
    }, []);

    const open = useCallback(
        (id: string) => {
            request({action: 'open', nextScreen: id});
        },
        [request],
    );
    const back = useCallback(() => {
        request({action: 'back', nextScreen: 'chat'});
    }, [request]);
    const requestClose = useCallback(() => {
        request({action: 'close'});
    }, [request]);
    return {current, selected, context: {open, back, requestClose, pending}};
}
