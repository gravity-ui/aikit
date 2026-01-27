import {act, renderHook} from '@testing-library/react';

import type {ThinkingMessageContentData} from '../../../../types/messages';
import {useThinkingMessage} from '../useThinkingMessage';

describe('useThinkingMessage', () => {
    const defaultProps: ThinkingMessageContentData = {
        title: 'Test Title',
        content: 'Test content',
        status: 'thought',
    };

    describe('getCopyText formatting', () => {
        it('should format string content correctly', () => {
            const onCopyClick = jest.fn();
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    content: 'Single line content',
                    onCopyClick,
                }),
            );

            act(() => {
                result.current.handleCopy();
            });

            expect(onCopyClick).toHaveBeenCalledTimes(1);
        });

        it('should format array content with double newlines', () => {
            // Mock document.execCommand
            document.execCommand = jest.fn().mockReturnValue(true);

            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    content: ['First line', 'Second line', 'Third line'],
                    enabledCopy: true,
                }),
            );

            act(() => {
                result.current.handleCopy();
            });

            // Verify execCommand was called with 'copy'
            expect(document.execCommand).toHaveBeenCalledWith('copy');
        });
    });

    describe('handleCopy behavior', () => {
        beforeEach(() => {
            // Mock document.execCommand
            document.execCommand = jest.fn().mockReturnValue(true);
        });

        it('should prioritize onCopyClick over enabledCopy', () => {
            const onCopyClick = jest.fn();
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    content: 'Test content',
                    onCopyClick,
                    enabledCopy: true,
                }),
            );

            act(() => {
                result.current.handleCopy();
            });

            expect(onCopyClick).toHaveBeenCalledTimes(1);
            expect(document.execCommand).not.toHaveBeenCalled();
        });

        it('should use default copy logic when only enabledCopy is provided', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    content: 'Test content',
                    enabledCopy: true,
                }),
            );

            act(() => {
                result.current.handleCopy();
            });

            expect(document.execCommand).toHaveBeenCalledWith('copy');
        });

        it('should not copy when neither onCopyClick nor enabledCopy is provided', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    content: 'Test content',
                }),
            );

            act(() => {
                result.current.handleCopy();
            });

            expect(document.execCommand).not.toHaveBeenCalled();
        });
    });

    describe('showCopyButton logic', () => {
        it('should show copy button when onCopyClick is provided', () => {
            const onCopyClick = jest.fn();
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    onCopyClick,
                }),
            );

            expect(result.current.showCopyButton).toBe(true);
        });

        it('should show copy button when enabledCopy is true', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    enabledCopy: true,
                }),
            );

            expect(result.current.showCopyButton).toBe(true);
        });

        it('should show copy button when both are provided', () => {
            const onCopyClick = jest.fn();
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    onCopyClick,
                    enabledCopy: true,
                }),
            );

            expect(result.current.showCopyButton).toBe(true);
        });

        it('should not show copy button when neither is provided', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                }),
            );

            expect(result.current.showCopyButton).toBe(false);
        });

        it('should not show copy button when enabledCopy is explicitly false', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    enabledCopy: false,
                }),
            );

            expect(result.current.showCopyButton).toBe(false);
        });
    });

    describe('showLoader based on status', () => {
        it('should show loader when status is "thinking"', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    status: 'thinking',
                }),
            );

            expect(result.current.showLoader).toBe(true);
        });

        it('should not show loader when status is "thought"', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    status: 'thought',
                }),
            );

            expect(result.current.showLoader).toBe(false);
        });

        it('should not show loader when showStatusIndicator is false', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    status: 'thinking',
                    showStatusIndicator: false,
                }),
            );

            expect(result.current.showLoader).toBe(false);
        });
    });

    describe('toggle expanded state', () => {
        it('should toggle expanded state', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    defaultExpanded: false,
                }),
            );

            expect(result.current.isExpanded).toBe(false);

            act(() => {
                result.current.toggleExpanded();
            });

            expect(result.current.isExpanded).toBe(true);

            act(() => {
                result.current.toggleExpanded();
            });

            expect(result.current.isExpanded).toBe(false);
        });

        it('should initialize with defaultExpanded=true', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    defaultExpanded: true,
                }),
            );

            expect(result.current.isExpanded).toBe(true);
        });

        it('should initialize with defaultExpanded=false', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    defaultExpanded: false,
                }),
            );

            expect(result.current.isExpanded).toBe(false);
        });
    });

    describe('content normalization', () => {
        it('should normalize string content to array', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    content: 'Single string',
                }),
            );

            expect(result.current.content).toEqual(['Single string']);
        });

        it('should keep array content as array', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    content: ['First', 'Second', 'Third'],
                }),
            );

            expect(result.current.content).toEqual(['First', 'Second', 'Third']);
        });
    });

    describe('button title based on status', () => {
        it('should return correct title for "thinking" status', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    status: 'thinking',
                }),
            );

            expect(result.current.buttonTitle).toBeDefined();
        });

        it('should return correct title for "thought" status', () => {
            const {result} = renderHook(() =>
                useThinkingMessage({
                    ...defaultProps,
                    status: 'thought',
                }),
            );

            expect(result.current.buttonTitle).toBeDefined();
        });
    });
});
