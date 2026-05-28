import {Component, type ErrorInfo, type ReactNode} from 'react';

import type {GenUIContext, GenUIError} from '../types';

import {DefaultErrorSlot} from './DefaultErrorSlot';

export type ToolPartErrorBoundaryProps = {
    context: GenUIContext;
    onError?: (error: GenUIError) => void;
    children: ReactNode;
};

type State = {error: GenUIError | null};

/**
 * Per-part error boundary (§12 E3): isolates render failures of one tool from
 * the surrounding message. Errors are surfaced via `onError` so the host can
 * log / report them.
 */
export class ToolPartErrorBoundary extends Component<ToolPartErrorBoundaryProps, State> {
    static getDerivedStateFromError(thrown: unknown): State {
        const message =
            thrown instanceof Error ? thrown.message : 'Tool component crashed during render';
        return {
            error: {
                code: 'render-error',
                message,
                cause: thrown,
            },
        };
    }

    state: State = {error: null};

    componentDidCatch(thrown: unknown, info: ErrorInfo) {
        const error: GenUIError = {
            code: 'render-error',
            message: thrown instanceof Error ? thrown.message : String(thrown),
            cause: {thrown, info},
        };
        this.props.onError?.(error);
    }

    render() {
        if (this.state.error) {
            return <DefaultErrorSlot error={this.state.error} context={this.props.context} />;
        }
        return this.props.children;
    }
}
