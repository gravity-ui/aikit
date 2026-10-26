/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';

import type {TChatMessage, TextMessageContent, ThinkingMessageContent} from '../../types/messages';
import {hasOnlyThinkingContent, normalizeContent, resolveMessageActions} from '../messageUtils';

describe('normalizeContent', () => {
    it.each(['', ' ', '\t', '\n', '\r\n', ' \t\n\r ', '\u00a0\u2003\u2028'])(
        'should omit blank text %j in every supported content shape',
        (text) => {
            const part: TextMessageContent = {type: 'text', data: {text}};

            expect(normalizeContent(text)).toEqual([]);
            expect(normalizeContent(part)).toEqual([]);
            expect(normalizeContent([part, part])).toEqual([]);
        },
    );

    it('should preserve meaningful text and its surrounding whitespace', () => {
        const text = ' \tHello\n ';
        const part: TextMessageContent = {type: 'text', data: {text}};

        expect(normalizeContent(text)).toEqual([part]);
        expect(normalizeContent(part)[0]).toBe(part);
    });

    it('should omit empty text parts without mutating mixed content', () => {
        const empty: TextMessageContent = {type: 'text', data: {text: '\t\n'}};
        const text: TextMessageContent = {type: 'text', data: {text: 'Hello'}};
        const custom = {type: 'custom', data: {value: 0}};
        const parts = [empty, custom, text, empty];

        expect(normalizeContent(parts)).toEqual([custom, text]);
        expect(parts).toEqual([empty, custom, text, empty]);
    });

    it('should preserve thinking indicators and ignore blank text when detecting thinking-only content', () => {
        const thinking: ThinkingMessageContent = {
            type: 'thinking',
            data: {content: '', status: 'thinking'},
        };
        const parts = [thinking, {type: 'text' as const, data: {text: ' \n'}}];

        expect(normalizeContent(parts)).toEqual([thinking]);
        expect(hasOnlyThinkingContent(parts)).toBe(true);
        expect(hasOnlyThinkingContent(' \n')).toBe(false);
    });
});

const makeAssistantMessage = (overrides?: object): TChatMessage => ({
    id: 'msg-1',
    role: 'assistant',
    content: 'Hello',
    ...overrides,
});

describe('resolveMessageActions', () => {
    it('should return message.actions when present, ignoring defaultActions', () => {
        const customAction = {actionType: 'custom', onClick: jest.fn()};
        const message = makeAssistantMessage({actions: [customAction]});
        const defaultActions = [{type: 'copy', onClick: jest.fn()}];

        const result = resolveMessageActions(message, defaultActions);

        expect(result).toBe(message.actions);
    });

    it('should return undefined when no actions and no defaultActions', () => {
        const message = makeAssistantMessage();

        expect(resolveMessageActions(message)).toBeUndefined();
        expect(resolveMessageActions(message, undefined)).toBeUndefined();
    });

    it('should map defaultActions to BaseMessageActionConfig', () => {
        const message = makeAssistantMessage();
        const onClick = jest.fn();
        const defaultActions = [{type: 'copy', onClick, label: 'Copy', view: 'flat' as const}];

        const result = resolveMessageActions(message, defaultActions);

        expect(result).toHaveLength(1);
        expect(result![0]).toMatchObject({
            actionType: 'copy',
            label: 'Copy',
            view: 'flat',
        });
    });

    it('should bind onClick so it calls with the message', () => {
        const onClick = jest.fn();
        const message = makeAssistantMessage();
        const defaultActions = [{type: 'copy', onClick}];

        const result = resolveMessageActions(message, defaultActions);
        const resolvedAction = result![0] as {onClick?: () => void};
        resolvedAction.onClick?.();

        expect(onClick).toHaveBeenCalledWith(message);
    });

    it('should pass static icon ReactNode as-is', () => {
        const icon = React.createElement('span', {}, 'icon');
        const message = makeAssistantMessage();
        const defaultActions = [{type: 'copy', onClick: jest.fn(), icon}];

        const result = resolveMessageActions(message, defaultActions);
        const resolved = result![0] as {icon?: unknown};

        expect(resolved.icon).toBe(icon);
    });

    it('should pass static children ReactNode as-is', () => {
        const children = React.createElement('span', {}, '42 tokens');
        const message = makeAssistantMessage();
        const defaultActions = [{type: 'tokens', onClick: jest.fn(), children}];

        const result = resolveMessageActions(message, defaultActions);
        const resolved = result![0] as {children?: unknown};

        expect(resolved.children).toBe(children);
    });

    it('should resolve children render function with the message', () => {
        const message = makeAssistantMessage({metadata: {outputTokens: 42}});
        const childrenFn = jest.fn(
            (msg: TChatMessage) =>
                `${(msg as {metadata?: {outputTokens?: number}}).metadata?.outputTokens} tokens`,
        );
        const defaultActions = [{type: 'tokens', onClick: jest.fn(), children: childrenFn}];

        const result = resolveMessageActions(message, defaultActions);
        const resolved = result![0] as {children?: unknown};

        expect(childrenFn).toHaveBeenCalledWith(message);
        expect(resolved.children).toBe('42 tokens');
    });

    it('should keep static icon alongside resolved children render function', () => {
        const message = makeAssistantMessage({metadata: {outputTokens: 7}});
        const staticIcon = React.createElement('span', {}, 'icon');
        const childrenFn = jest.fn(
            (msg: TChatMessage) =>
                `${(msg as {metadata?: {outputTokens?: number}}).metadata?.outputTokens}`,
        );
        const defaultActions = [
            {type: 'custom', onClick: jest.fn(), icon: staticIcon, children: childrenFn},
        ];

        const result = resolveMessageActions(message, defaultActions);
        const resolved = result![0] as {icon?: unknown; children?: unknown};

        expect(childrenFn).toHaveBeenCalledWith(message);
        expect(resolved.icon).toBe(staticIcon);
        expect(resolved.children).toBe('7');
    });
});
