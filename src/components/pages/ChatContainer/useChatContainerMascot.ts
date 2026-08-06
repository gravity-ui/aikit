import {useCallback, useEffect, useRef, useState} from 'react';

import {useMascotState} from '../../../hooks';
import type {ChatStatus, MascotState, MascotView} from '../../../types';

import type {MascotConfig} from './types';

const TYPING_IDLE_DELAY_MS = 1_500;

export function useChatContainerMascot<TAsset>(args: {
    config?: MascotConfig<TAsset>;
    view: MascotView;
    status: ChatStatus;
    messagesCount: number;
    activeChatId?: string;
    promptInputKey: number;
}) {
    const {config, view, status, messagesCount, activeChatId, promptInputKey} = args;
    const enabled = Boolean(config);
    const [isTyping, setIsTyping] = useState(false);
    const [stopSignal, setStopSignal] = useState(0);
    const [activitySignal, setActivitySignal] = useState(0);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const previousActivityInputsRef = useRef({status, messagesCount, activeChatId, promptInputKey});

    const notifyActivity = useCallback(() => {
        if (enabled) {
            setActivitySignal((value) => value + 1);
        }
    }, [enabled]);

    const handleValueChange = useCallback(
        (value: string) => {
            clearTimeout(typingTimerRef.current);
            notifyActivity();
            if (value.length === 0) {
                setIsTyping(false);
                return;
            }
            setIsTyping(true);
            typingTimerRef.current = setTimeout(() => setIsTyping(false), TYPING_IDLE_DELAY_MS);
        },
        [notifyActivity],
    );

    const handleCancelResolved = useCallback(() => {
        if (enabled) {
            setStopSignal((value) => value + 1);
            notifyActivity();
        }
    }, [enabled, notifyActivity]);

    useEffect(() => {
        const previous = previousActivityInputsRef.current;
        previousActivityInputsRef.current = {status, messagesCount, activeChatId, promptInputKey};
        if (
            previous.status !== status ||
            previous.messagesCount !== messagesCount ||
            previous.activeChatId !== activeChatId ||
            previous.promptInputKey !== promptInputKey
        ) {
            clearTimeout(typingTimerRef.current);
            setIsTyping(false);
            notifyActivity();
        }
    }, [activeChatId, messagesCount, notifyActivity, promptInputKey, status]);

    useEffect(() => () => clearTimeout(typingTimerRef.current), []);

    const state = useMascotState({
        view,
        status,
        isTyping,
        stateOverride: config?.stateOverride,
        sleepDelayMs: enabled ? config?.sleepDelayMs : null,
        onceDurations: config?.onceDurations,
        stopSignal,
        activitySignal,
    });
    const onStateChangeRef = useRef(config?.onStateChange);
    onStateChangeRef.current = config?.onStateChange;
    const previousStateRef = useRef<MascotState>();
    useEffect(() => {
        if (previousStateRef.current !== state) {
            previousStateRef.current = state;
            onStateChangeRef.current?.(state);
        }
    }, [state]);

    return {state, handleValueChange, handleCancelResolved, notifyActivity};
}
