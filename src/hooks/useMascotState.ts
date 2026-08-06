import {useCallback, useEffect, useRef, useState} from 'react';

import type {ChatStatus, MascotAnimationType, MascotState, MascotView} from '../types';

const PENDING_STATUSES = new Set<ChatStatus>(['submitted', 'streaming_loading', 'streaming']);

const DEFAULT_ONCE_DURATIONS = {
    reveal: 480,
    done: 600,
    error: 820,
    stopped: 320,
} as const;

type OnceState = keyof typeof DEFAULT_ONCE_DURATIONS;

export interface UseMascotStateOptions {
    view: MascotView;
    status?: ChatStatus;
    isTyping?: boolean;
    stateOverride?: MascotState;
    sleepDelayMs?: number | null;
    onceDurations?: Partial<Record<OnceState, number>>;
    stopSignal?: unknown;
    activitySignal?: unknown;
}

export function getMascotAnimationType(state: MascotState): MascotAnimationType {
    return state === 'reveal' || state === 'done' || state === 'error' || state === 'stopped'
        ? 'once'
        : 'loop';
}

function initialState(options: UseMascotStateOptions): MascotState {
    if (options.stateOverride) {
        return options.stateOverride;
    }
    if (options.view === 'hero') {
        return options.isTyping ? 'reading' : 'idle';
    }
    if (options.status === 'error') {
        return 'error';
    }
    if (options.status && PENDING_STATUSES.has(options.status)) {
        return 'thinking';
    }
    return 'reveal';
}

function shouldShowReading(status: ChatStatus, isTyping: boolean) {
    return status === 'ready' && isTyping;
}

/** Derives the effective mascot state from chat lifecycle edges and activity. */
export function useMascotState(options: UseMascotStateOptions): MascotState {
    const {
        view,
        status = 'ready',
        isTyping = false,
        stateOverride,
        sleepDelayMs = 60_000,
        onceDurations,
        stopSignal,
        activitySignal,
    } = options;
    const [state, setState] = useState<MascotState>(() => initialState(options));
    const stateRef = useRef(state);
    stateRef.current = state;
    const previousViewRef = useRef(view);
    const previousStatusRef = useRef(status);
    const previousStopSignalRef = useRef(stopSignal);
    const previousActivitySignalRef = useRef(activitySignal);
    const revealedRef = useRef(view === 'chat');
    const activeOnceRef = useRef<OnceState | null>(
        view === 'chat' && (state === 'reveal' || state === 'error') ? state : null,
    );
    const onceTimerRef = useRef<ReturnType<typeof setTimeout>>();

    const cancelOnce = useCallback(() => {
        clearTimeout(onceTimerRef.current);
        activeOnceRef.current = null;
    }, []);

    const startOnce = useCallback(
        (nextState: OnceState) => {
            clearTimeout(onceTimerRef.current);
            activeOnceRef.current = nextState;
            setState(nextState);
            const duration = onceDurations?.[nextState] ?? DEFAULT_ONCE_DURATIONS[nextState];
            onceTimerRef.current = setTimeout(
                () => {
                    if (activeOnceRef.current === nextState) {
                        activeOnceRef.current = null;
                        setState('idle');
                    }
                },
                Math.max(0, duration),
            );
        },
        [onceDurations],
    );

    // Start the once timer for an initial chat reveal/error.
    useEffect(() => {
        const initialOnce = activeOnceRef.current;
        if (initialOnce) {
            startOnce(initialOnce);
        }
        return cancelOnce;
        // This effect is intentionally mount-only; later edges are handled below.
    }, []);

    useEffect(() => {
        const previousView = previousViewRef.current;
        const previousStatus = previousStatusRef.current;
        const stopChanged = previousStopSignalRef.current !== stopSignal;
        const activityChanged = previousActivitySignalRef.current !== activitySignal;
        previousViewRef.current = view;
        previousStatusRef.current = status;
        previousStopSignalRef.current = stopSignal;
        previousActivitySignalRef.current = activitySignal;

        if (stateOverride !== undefined) {
            cancelOnce();
            setState(stateOverride);
            return;
        }

        const errorEdge = previousStatus !== 'error' && status === 'error';
        const successEdge = PENDING_STATUSES.has(previousStatus) && status === 'ready';
        const chatEntry = view === 'chat' && previousView !== 'chat' && !revealedRef.current;

        if (errorEdge) {
            startOnce('error');
            return;
        }
        if (activeOnceRef.current === 'error') {
            return;
        }
        if (stopChanged) {
            startOnce('stopped');
            return;
        }
        if (activeOnceRef.current === 'stopped') {
            return;
        }
        if (PENDING_STATUSES.has(status)) {
            cancelOnce();
            setState('thinking');
            return;
        }
        if (successEdge) {
            startOnce('done');
            return;
        }
        if (shouldShowReading(status, isTyping)) {
            cancelOnce();
            setState('reading');
            return;
        }
        if (activeOnceRef.current === 'done') {
            return;
        }
        if (chatEntry) {
            revealedRef.current = true;
            startOnce('reveal');
            return;
        }
        if (activeOnceRef.current === 'reveal') {
            return;
        }
        if (view === 'hero') {
            cancelOnce();
            setState(isTyping ? 'reading' : 'idle');
            return;
        }
        if (stateRef.current !== 'sleeping' || activityChanged) {
            setState('idle');
        }
    }, [activitySignal, cancelOnce, isTyping, startOnce, stateOverride, status, stopSignal, view]);

    useEffect(() => {
        if (
            view !== 'chat' ||
            status !== 'ready' ||
            stateOverride !== undefined ||
            state !== 'idle' ||
            sleepDelayMs === null ||
            sleepDelayMs <= 0
        ) {
            return undefined;
        }
        const timer = setTimeout(() => setState('sleeping'), sleepDelayMs);
        return () => clearTimeout(timer);
    }, [activitySignal, sleepDelayMs, state, stateOverride, status, view]);

    return state;
}
