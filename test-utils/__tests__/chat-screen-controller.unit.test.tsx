import {act, renderHook} from '@testing-library/react';

import type {
    ChatScreenDefinition,
    ChatScreenNavigationProps,
} from '../../src/components/pages/ChatContainer/screenTypes';
import {useChatScreenNavigation} from '../../src/components/pages/ChatContainer/useChatScreenNavigation';

const instructions: ChatScreenDefinition = {
    id: 'instructions',
    title: 'Instructions',
    render: () => null,
};
const settings: ChatScreenDefinition = {id: 'settings', title: 'Settings', render: () => null};
const flush = () => act(async () => {});

it('opens a secondary screen and returns directly to chat, without a stack', async () => {
    const onScreenChange = jest.fn();
    const {result} = renderHook(() =>
        useChatScreenNavigation({screens: [instructions, settings], onScreenChange}),
    );
    act(() => result.current.context.open('instructions'));
    await flush();
    expect(result.current.current).toBe('instructions');
    act(() => result.current.context.open('settings'));
    await flush();
    act(() => result.current.context.back());
    await flush();
    expect(result.current.current).toBe('chat');
    expect(onScreenChange).toHaveBeenLastCalledWith('chat', {
        previousScreen: 'settings',
        reason: 'back',
    });
});

it('does not commit a controlled request until the consumer accepts it', async () => {
    const onScreenChange = jest.fn();
    const {result, rerender} = renderHook(
        (props: ChatScreenNavigationProps) => useChatScreenNavigation(props),
        {
            initialProps: {screens: [instructions], activeScreen: 'chat', onScreenChange},
        },
    );
    act(() => result.current.context.open('instructions'));
    await flush();
    expect(result.current.current).toBe('chat');
    expect(onScreenChange).toHaveBeenCalledTimes(1);
    rerender({screens: [instructions], activeScreen: 'instructions', onScreenChange});
    expect(result.current.current).toBe('instructions');
    expect(onScreenChange).toHaveBeenCalledTimes(1);
});

it('rejects unavailable destinations and reconciles a disabled controlled selection once', async () => {
    const onScreenChange = jest.fn();
    const {result, rerender} = renderHook(
        (props: ChatScreenNavigationProps) => useChatScreenNavigation(props),
        {
            initialProps: {
                screens: [{...instructions, enabled: false}],
                activeScreen: 'chat',
                onScreenChange,
            },
        },
    );
    act(() => result.current.context.open('instructions'));
    act(() => result.current.context.open('unknown'));
    await flush();
    expect(onScreenChange).not.toHaveBeenCalled();
    const unavailable = {
        screens: [{...instructions, enabled: false}],
        activeScreen: 'instructions',
        onScreenChange,
    };
    rerender(unavailable);
    rerender({...unavailable});
    expect(result.current.current).toBe('chat');
    expect(onScreenChange).toHaveBeenCalledTimes(1);
    expect(onScreenChange).toHaveBeenCalledWith('chat', {
        previousScreen: 'instructions',
        reason: 'unavailable',
    });
});

it('serializes guards and ignores their completion after an external screen change', async () => {
    let resolve!: (allowed: boolean) => void;
    const beforeLeave = jest.fn(
        () =>
            new Promise<boolean>((done) => {
                resolve = done;
            }),
    );
    const onScreenChange = jest.fn();
    const onClose = jest.fn();
    const screens = [{...instructions, beforeLeave}, settings];
    const {result, rerender} = renderHook(
        (activeScreen: string) =>
            useChatScreenNavigation({screens, activeScreen, onScreenChange, onClose}),
        {initialProps: 'instructions'},
    );
    act(() => result.current.context.back());
    act(() => result.current.context.requestClose());
    expect(beforeLeave).toHaveBeenCalledTimes(1);
    expect(result.current.context.pending).toBe(true);
    rerender('settings');
    await act(async () => resolve(true));
    expect(result.current.current).toBe('settings');
    expect(result.current.context.pending).toBe(false);
    expect(onScreenChange).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
});

it('keeps the form after a rejected guard and allows a subsequent close', async () => {
    const beforeLeave = jest
        .fn()
        .mockRejectedValueOnce(new Error('confirmation failed'))
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
    const onScreenNavigationError = jest.fn();
    const onClose = jest.fn();
    const {result} = renderHook(() =>
        useChatScreenNavigation({
            screens: [{...instructions, beforeLeave}],
            defaultActiveScreen: 'instructions',
            onScreenNavigationError,
            onClose,
        }),
    );
    act(() => result.current.context.back());
    await flush();
    expect(onScreenNavigationError).toHaveBeenCalledTimes(1);
    expect(result.current.current).toBe('instructions');
    act(() => result.current.context.requestClose());
    await flush();
    expect(onClose).not.toHaveBeenCalled();
    act(() => result.current.context.requestClose());
    await flush();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(result.current.current).toBe('instructions');
});

it('allows Close and opening an available screen while a controlled invalid selection remains unchanged', async () => {
    const onClose = jest.fn();
    const onScreenChange = jest.fn();
    const {result, rerender} = renderHook(() =>
        useChatScreenNavigation({
            activeScreen: 'missing',
            screens: [instructions],
            onClose,
            onScreenChange,
        }),
    );
    expect(result.current.current).toBe('chat');
    expect(onScreenChange).toHaveBeenCalledTimes(1);
    act(() => result.current.context.requestClose());
    await flush();
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender();
    act(() => result.current.context.open('instructions'));
    await flush();
    expect(onScreenChange).toHaveBeenLastCalledWith('instructions', {
        previousScreen: 'chat',
        reason: 'open',
    });
    expect(onScreenChange).toHaveBeenCalledTimes(2);
});
