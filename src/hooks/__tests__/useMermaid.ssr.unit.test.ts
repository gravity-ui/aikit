/** @jest-environment node */
import {createElement} from 'react';

import {renderToString} from 'react-dom/server';

import type {MermaidOptions} from '../../utils/renderMermaid';
import {useMermaid} from '../useMermaid';

jest.mock('uuid', () => ({v4: () => 'diagram-id'}));

function ServerHookProbe({options}: {options?: MermaidOptions}) {
    useMermaid({current: null}, '', false, options);
    return null;
}

describe('useMermaid during SSR', () => {
    test.each([false, true])('does not warn or load Mermaid when enabled=%s', (enabled) => {
        const load = jest.fn();
        const error = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            expect(
                renderToString(
                    createElement(ServerHookProbe, {options: enabled ? {load} : undefined}),
                ),
            ).toBe('');
            expect(load).not.toHaveBeenCalled();
            expect(error).not.toHaveBeenCalled();
        } finally {
            error.mockRestore();
        }
    });
});
