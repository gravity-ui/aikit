import {act, renderHook} from '@testing-library/react';

import {usePromptInput} from '../usePromptInput';

function pendingSend() {
    let resolve!: (result: void | false) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<void | false>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {promise, resolve, reject};
}

it('clears immediately during streaming and preserves the next draft on success', async () => {
    const send = pendingSend();
    const {result, rerender} = renderHook(
        ({status}: {status: 'ready' | 'streaming'}) =>
            usePromptInput({
                initialValue: 'first',
                onSend: () => send.promise,
                onCancel: async () => {},
                status,
            }),
        {initialProps: {status: 'ready'}},
    );
    act(() => {
        result.current.handleSubmit();
    });
    expect(result.current.value).toBe('');
    rerender({status: 'streaming'});
    expect(result.current.isInputDisabled).toBe(false);
    act(() => result.current.handleChange('next'));
    await act(async () => send.resolve());
    expect(result.current.value).toBe('next');
});

it.each(['false', 'reject'])(
    'restores text and files on %s and clears them after Retry',
    async (mode) => {
        const send = pendingSend();
        const file = new File(['data'], 'file.txt');
        const {result} = renderHook(() =>
            usePromptInput({initialValue: 'original', onSend: () => send.promise}),
        );
        act(() => result.current.setAttachments([file]));
        act(() => {
            result.current.handleSubmit();
        });
        expect(result.current.value).toBe('');
        expect(result.current.attachments).toEqual([]);
        await act(async () => {
            if (mode === 'false') send.resolve(false);
            else send.reject(new Error('failed'));
        });
        expect(result.current.value).toBe('original');
        expect(result.current.attachments).toEqual([file]);
        act(() => {
            expect(result.current.clearFailedDraft()).toBe(true);
        });
        expect(result.current.value).toBe('');
        expect(result.current.attachments).toEqual([]);
    },
);

it.each(['text', 'files', 'conversation'])(
    'does not clear a changed %s after Retry',
    async (change) => {
        const {result, rerender} = renderHook(
            ({resetKey}) =>
                usePromptInput({initialValue: 'old', onSend: async () => false, resetKey}),
            {initialProps: {resetKey: 0}},
        );
        await act(() => result.current.handleSubmit());
        if (change === 'text') act(() => result.current.handleChange('new'));
        if (change === 'files')
            act(() => result.current.setAttachments([new File(['new'], 'new.txt')]));
        if (change === 'conversation') rerender({resetKey: 1});
        act(() => {
            expect(result.current.clearFailedDraft()).toBe(false);
        });
    },
);

it('does not restore an old draft over new typing after a late rejection', async () => {
    const send = pendingSend();
    const {result} = renderHook(() =>
        usePromptInput({initialValue: 'old', onSend: () => send.promise}),
    );
    act(() => {
        result.current.handleSubmit();
    });
    act(() => result.current.handleChange('new'));
    await act(async () => send.reject(new Error('failed')));
    expect(result.current.value).toBe('new');
    expect(result.current.sendError).toBe(false);
});
