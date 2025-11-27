import React from 'react';

import {act, renderHook} from '@testing-library/react';

import type {ToolMessageProps} from '../types/tool';

import {useToolMessage} from './useToolMessage';

describe('useToolMessage', () => {
    const defaultProps: ToolMessageProps = {
        toolName: 'Test Tool',
    };

    it('should toggle expanded state', () => {
        const {result} = renderHook(() =>
            useToolMessage({
                ...defaultProps,
                bodyContent: <div>Content</div>,
            }),
        );

        expect(result.current.isExpanded).toBe(false);

        act(() => {
            result.current.toggleExpanded();
        });

        expect(result.current.isExpanded).toBe(true);
    });

    it('should return waiting state for waitingConfirmation status', () => {
        const {result} = renderHook(() =>
            useToolMessage({
                ...defaultProps,
                status: 'waitingConfirmation',
            }),
        );

        expect(result.current.isWaiting).toBe(true);
        expect(result.current.showLoader).toBe(true);
        expect(result.current.footerContent).toBe('Awaiting confirmation');
    });

    it('should return default footer actions for waitingConfirmation', () => {
        const onAccept = jest.fn();
        const onReject = jest.fn();

        const {result} = renderHook(() =>
            useToolMessage({
                ...defaultProps,
                status: 'waitingConfirmation',
                onAccept,
                onReject,
            }),
        );

        expect(result.current.footerActions).toHaveLength(2);
        expect(result.current.footerActions[0]?.label).toBe('Reject');
        expect(result.current.footerActions[1]?.label).toBe('Accept');
    });

    it('should add expand action when bodyContent is provided', () => {
        const {result} = renderHook(() =>
            useToolMessage({
                ...defaultProps,
                bodyContent: <div>Content</div>,
            }),
        );

        expect(result.current.headerActions).toHaveLength(1);
        expect(result.current.headerActions[0]?.label).toBe('Expand');
    });

    it('should initialize expanded for waiting statuses', () => {
        const {result} = renderHook(() =>
            useToolMessage({
                ...defaultProps,
                status: 'waitingConfirmation',
            }),
        );

        expect(result.current.isExpanded).toBe(true);
    });

    it('should collapse when status changes to success with autoCollapseOnSuccess enabled', () => {
        const {result, rerender} = renderHook((props: ToolMessageProps) => useToolMessage(props), {
            initialProps: {
                ...defaultProps,
                bodyContent: <div>Content</div>,
                status: 'loading',
                autoCollapseOnSuccess: true,
            },
        });

        act(() => {
            result.current.toggleExpanded();
        });

        expect(result.current.isExpanded).toBe(true);

        rerender({
            ...defaultProps,
            bodyContent: <div>Content</div>,
            status: 'success',
            autoCollapseOnSuccess: true,
        });

        expect(result.current.isExpanded).toBe(false);
    });

    it('should collapse when status changes to cancelled with autoCollapseOnCancelled enabled', () => {
        const {result, rerender} = renderHook((props: ToolMessageProps) => useToolMessage(props), {
            initialProps: {
                ...defaultProps,
                bodyContent: <div>Content</div>,
                status: 'loading',
                autoCollapseOnCancelled: true,
            },
        });

        act(() => {
            result.current.toggleExpanded();
        });

        expect(result.current.isExpanded).toBe(true);

        rerender({
            ...defaultProps,
            bodyContent: <div>Content</div>,
            status: 'cancelled',
            autoCollapseOnCancelled: true,
        });

        expect(result.current.isExpanded).toBe(false);
    });
});
