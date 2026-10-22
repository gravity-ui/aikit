import {act, renderHook, waitFor} from '@testing-library/react';

import type {PromptCommandItem, PromptCommandSource} from '../../../../types';
import {findCommandMatch, replaceCommand} from '../commandUtils';
import {usePromptCommands} from '../usePromptCommands';
import {usePromptInput} from '../usePromptInput';

const item: PromptCommandItem = {id: 'review', title: 'Review', data: {mode: 'review'}};
const sources: PromptCommandSource[] = [
    {id: 'commands', title: 'Commands', trigger: '/', items: [item]},
    {id: 'context', title: 'Context', trigger: '@', items: [item]},
];

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {promise, resolve, reject};
}

describe('command parsing', () => {
    it.each(['https://example.com/review', 'path/review', 'name@example.com'])(
        'does not open for %s',
        (text) => {
            expect(findCommandMatch(text, text.length, text.length, sources)).toBeUndefined();
        },
    );
    it('replaces the whole active token in the middle without changing adjacent text', () => {
        const text = 'Please /review this';
        const match = findCommandMatch(text, 10, 10, sources);
        if (!match) throw new Error('Expected an active command');
        expect(match.query).toBe('re');
        expect(replaceCommand(text, match, 'explain')).toEqual({
            value: 'Please explain  this',
            caret: 15,
        });
    });
    it('ignores non-collapsed selections and supports newlines', () => {
        expect(findCommandMatch('/review', 0, 7, sources)).toBeUndefined();
        expect(findCommandMatch('text\n/re', 8, 8, sources)?.query).toBe('re');
    });
});

describe('command search and selection', () => {
    it('ignores stale asynchronous results even when the loader ignores AbortSignal', async () => {
        const first = deferred<readonly PromptCommandItem[]>();
        const second = deferred<readonly PromptCommandItem[]>();
        const getItems = jest
            .fn()
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);
        const config = {sources: [{...sources[0], getItems}]};
        const {result} = renderHook(() =>
            usePromptCommands({
                config,
                value: '',
                onChange: jest.fn(),
                inputRef: {current: null},
                disabled: false,
            }),
        );
        act(() => result.current.openSource('commands'));
        await waitFor(() => expect(getItems).toHaveBeenCalledTimes(1));
        act(() => result.current.search('new'));
        await waitFor(() => expect(getItems).toHaveBeenCalledTimes(2));
        expect(getItems.mock.calls[0][1].signal.aborted).toBe(true);
        await act(async () => second.resolve([{...item, id: 'new'}]));
        await act(async () => first.resolve([{...item, id: 'stale'}]));
        expect(result.current.items.map((entry) => entry.id)).toEqual(['new']);
    });
    it('resets uncontrolled selections and search on conversation changes without remounting', async () => {
        const config = {sources};
        const {result, rerender} = renderHook(
            ({resetKey}) =>
                usePromptCommands({
                    config,
                    resetKey,
                    value: 'draft',
                    onChange: jest.fn(),
                    inputRef: {current: null},
                    disabled: false,
                }),
            {initialProps: {resetKey: 'chat-a'}},
        );
        act(() => result.current.openSource('commands'));
        await waitFor(() => expect(result.current.items).toHaveLength(1));
        act(() => result.current.select(item));
        act(() => result.current.openSource('commands'));
        expect(result.current.selections).toHaveLength(1);
        rerender({resetKey: 'chat-b'});
        expect(result.current.selections).toEqual([]);
        expect(result.current.open).toBe(false);
    });
    it('does not overwrite application-owned selections on reset', () => {
        const selections = [{sourceId: 'commands', id: 'review', title: 'Review'}];
        const onSelectionsChange = jest.fn();
        const config = {sources, selections, onSelectionsChange};
        const {result, rerender} = renderHook(
            ({resetKey}) =>
                usePromptCommands({
                    config,
                    resetKey,
                    value: '',
                    onChange: jest.fn(),
                    inputRef: {current: null},
                    disabled: false,
                }),
            {initialProps: {resetKey: 0}},
        );
        rerender({resetKey: 1});
        expect(result.current.selections).toBe(selections);
        expect(onSelectionsChange).not.toHaveBeenCalled();
    });
    it('does not clear application selections after its input is unmounted', () => {
        const selection = {sourceId: 'commands', id: 'review', title: 'Review'};
        const onSelectionsChange = jest.fn();
        const config = {sources, selections: [selection], onSelectionsChange};
        const {result, unmount} = renderHook(() =>
            usePromptCommands({
                config,
                value: 'draft',
                onChange: jest.fn(),
                inputRef: {current: null},
                disabled: false,
            }),
        );
        const clearSubmitted = result.current.clearSubmitted;
        unmount();
        clearSubmitted([selection]);
        expect(onSelectionsChange).not.toHaveBeenCalled();
    });
    it('does not reopen on delayed selection events after choosing an item', async () => {
        const config = {sources};
        const {result} = renderHook(() =>
            usePromptCommands({
                config,
                value: '/re',
                onChange: jest.fn(),
                inputRef: {current: null},
                disabled: false,
            }),
        );
        act(() => result.current.detect('/re', 3, 3, true));
        await waitFor(() => expect(result.current.items).toHaveLength(1));
        act(() => result.current.select(item));
        act(() => result.current.detect('/re', 3, 3));
        expect(result.current.open).toBe(false);
        act(() => result.current.detect('/rev', 4, 4, true));
        expect(result.current.open).toBe(true);
    });
    it('does not delete highlighted text when context is selected through a button', async () => {
        const onChange = jest.fn();
        const config = {sources};
        const input = document.createElement('textarea');
        input.value = 'Keep this text';
        input.setSelectionRange(0, 4);
        const {result} = renderHook(() =>
            usePromptCommands({
                config,
                value: input.value,
                onChange,
                inputRef: {current: input},
                disabled: false,
            }),
        );
        act(() => result.current.openSource('commands'));
        await waitFor(() => expect(result.current.items).toHaveLength(1));
        act(() => result.current.select(item));
        expect(onChange).toHaveBeenCalledWith('Keep this text');
        expect(result.current.selections[0].data).toEqual({mode: 'review'});
    });
    it('keeps the picker and draft when the selection callback fails', async () => {
        const onChange = jest.fn();
        const config = {
            sources: [
                {
                    ...sources[0],
                    onSelect: () => {
                        throw new Error('Rejected');
                    },
                },
            ],
        };
        const {result} = renderHook(() =>
            usePromptCommands({
                config,
                value: '/re',
                onChange,
                inputRef: {current: null},
                disabled: false,
            }),
        );
        act(() => result.current.detect('/re', 3, 3));
        await waitFor(() => expect(result.current.items).toHaveLength(1));
        act(() => result.current.select(item));
        expect(result.current.error).toBe(true);
        expect(result.current.open).toBe(true);
        expect(result.current.selections).toEqual([]);
        expect(onChange).not.toHaveBeenCalled();
    });
});

describe('draft submission lifecycle', () => {
    it('does not notify a new owner about clearing an unmounted draft', async () => {
        const send = deferred<void>();
        const onValueChange = jest.fn();
        const {result, unmount} = renderHook(() =>
            usePromptInput({initialValue: 'old chat', onSend: () => send.promise, onValueChange}),
        );
        let pending: Promise<void>;
        act(() => {
            pending = result.current.handleSubmit();
        });
        onValueChange.mockClear();
        unmount();
        await act(async () => {
            send.resolve();
            await pending;
        });
        expect(onValueChange).not.toHaveBeenCalled();
    });
    it('prevents duplicate sends and does not clear newer edits when an old send resolves', async () => {
        const send = deferred<void>();
        const onSend = jest.fn().mockReturnValue(send.promise);
        const {result} = renderHook(() => usePromptInput({onSend, initialValue: 'first'}));
        let pending: Promise<void>;
        act(() => {
            pending = result.current.handleSubmit();
            result.current.handleSubmit();
        });
        expect(onSend).toHaveBeenCalledTimes(1);
        act(() => result.current.handleChange('next draft'));
        await act(async () => {
            send.resolve();
            await pending;
        });
        expect(result.current.value).toBe('next draft');
    });
});
