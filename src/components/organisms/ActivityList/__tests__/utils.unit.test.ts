import type {ThinkingMessageContentData} from '../../../../types/messages';
import {groupThinkingMessages, thinkingMessageToStep} from '../utils';

describe('thinking message migration and grouping', () => {
    const data: ThinkingMessageContentData = {content: ['first', 'second'], status: 'thought'};
    const one = {id: 'one', run: 'run-1', data};
    const two = {id: 'two', run: 'run-1', data: {...data, status: 'thinking' as const}};
    type Item = {id: string; run?: string; data?: ThinkingMessageContentData};
    const group = (items: readonly Item[]) =>
        groupThinkingMessages(items, {
            getStep: (item) => (item.data ? thinkingMessageToStep(item.id, item.data) : undefined),
            getGroupKey: (item) => item.run,
        });

    it('keeps legacy paragraphs in one step and preserves the copy callback', () => {
        const onCopyClick = jest.fn();
        const step = thinkingMessageToStep('one', {...data, title: 'Reasoning', onCopyClick});
        expect(step).toMatchObject({
            id: 'one',
            content: ['first', 'second'],
            title: 'Reasoning',
            onCopyClick,
        });
        expect(step.content).toBe(data.content);
    });

    it('preserves source objects, individual status and order', () => {
        const items = Object.freeze([Object.freeze(one), Object.freeze(two)]);
        const entries = group(items);
        expect(entries).toHaveLength(1);
        const entry = entries[0];
        if (entry.type !== 'thinking-group') throw new Error('Expected group');
        expect(entry.items[0]).toBe(one);
        expect(entry.items[1]).toBe(two);
        expect(entry.steps.map((step) => step.status)).toEqual(['thought', 'thinking']);
        expect(entry.steps.map((step) => step.id)).toEqual(['one', 'two']);
    });

    it('breaks groups at text/tools/users, scope changes and missing keys', () => {
        expect(group([one, {id: 'text', run: 'run-1'}, two])).toHaveLength(3);
        expect(group([one, {...two, run: 'retry'}])).toHaveLength(2);
        expect(
            group([
                {...one, run: undefined},
                {...two, run: undefined},
            ]),
        ).toHaveLength(2);
        expect(group([one, {...two, run: 'other-thread/run-1'}])).toHaveLength(2);
    });

    it('keeps a stable group ID as streaming appends and replaces details', () => {
        const first = group([one])[0];
        const updated = group([{...one, data: {...data, content: 'updated'}}, two])[0];
        if (first.type !== 'thinking-group' || updated.type !== 'thinking-group')
            throw new Error('Expected groups');
        expect(updated.id).toBe(first.id);
        expect(updated.steps[0].content).toBe('updated');
        const retry = group([{...one, run: 'retry'}])[0];
        if (retry.type !== 'thinking-group') throw new Error('Expected group');
        expect(retry.id).not.toBe(first.id);
    });
});
