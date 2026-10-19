import {useLayoutEffect} from 'react';

import {act, renderHook} from '@testing-library/react';

import {MARKDOWN_MERMAID_CLASS} from '../../utils/markdownMermaidPlugin';
import type {MermaidOptions} from '../../utils/renderMermaid';
import {useMermaid} from '../useMermaid';

jest.mock('uuid', () => ({v4: () => 'diagram-id'}));

const html = `<div class="${MARKDOWN_MERMAID_CLASS}"><pre><code>graph TD; A--&gt;B</code></pre></div>`;

describe('Mermaid opt-in and cached rendering', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        Object.defineProperty(SVGSVGElement.prototype, 'viewBox', {
            configurable: true,
            value: {baseVal: {width: 100}},
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        Reflect.deleteProperty(SVGSVGElement.prototype, 'viewBox');
    });

    function setup(options?: MermaidOptions) {
        const containerRef = {current: document.createElement('div')};
        const onLayout = jest.fn();
        const hook = renderHook(
            ({content, mermaidOptions}) => {
                // Simulate React replacing the message HTML during a commit.
                useLayoutEffect(() => {
                    containerRef.current.innerHTML = content;
                }, [content]);
                useMermaid(containerRef, content, false, mermaidOptions);
                useLayoutEffect(() => {
                    onLayout(containerRef.current.querySelector('svg'));
                }, [content, mermaidOptions]);
            },
            {initialProps: {content: html, mermaidOptions: options}},
        );
        return {...hook, container: containerRef.current, onLayout};
    }

    function createOptions() {
        return {
            load: jest.fn(async () => ({
                default: {
                    initialize: jest.fn(),
                    render: jest.fn(async () => ({svg: '<svg viewBox="0 0 100 50" />'})),
                },
            })),
        };
    }

    test('restores cached SVG during layout before the browser can paint streaming HTML', async () => {
        const options = createOptions();
        const {container, rerender, onLayout} = setup(options);
        await act(async () => {
            jest.advanceTimersByTime(150);
        });
        expect(container.querySelector('svg')).not.toBeNull();

        rerender({content: `${html}<p>More text</p>`, mermaidOptions: options});

        expect(onLayout).toHaveBeenLastCalledWith(expect.any(SVGSVGElement));
        expect(container.querySelector('pre')?.hidden).toBe(true);
        expect(options.load).toHaveBeenCalledTimes(1);
    });

    test('loads only after opt-in and restores the source when disabled', async () => {
        const options = createOptions();
        const {container, rerender} = setup();
        await act(async () => {
            jest.advanceTimersByTime(150);
        });
        expect(container.querySelector('svg')).toBeNull();
        expect(options.load).not.toHaveBeenCalled();

        rerender({content: html, mermaidOptions: options});
        await act(async () => {
            jest.advanceTimersByTime(150);
        });
        expect(container.querySelector('svg')).not.toBeNull();

        rerender({content: html, mermaidOptions: undefined});
        expect(container.querySelector('svg')).toBeNull();
        expect(container.querySelector('pre')?.hidden).toBe(false);
    });

    test('ignores a pending load after the feature is disabled', async () => {
        const renderer = {initialize: jest.fn(), render: jest.fn()};
        let resolveLoad!: (value: {default: typeof renderer}) => void;
        const options = {
            load: () =>
                new Promise<{default: typeof renderer}>((resolve) => {
                    resolveLoad = resolve;
                }),
        };
        const {container, rerender} = setup(options);
        await act(async () => {
            jest.advanceTimersByTime(150);
        });
        rerender({content: html, mermaidOptions: undefined});
        await act(async () => {
            resolveLoad({default: renderer});
        });
        expect(renderer.initialize).not.toHaveBeenCalled();
        expect(renderer.render).not.toHaveBeenCalled();
        expect(container.querySelector('svg')).toBeNull();
    });
});
