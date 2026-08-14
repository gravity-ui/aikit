import {useRef} from 'react';

import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';

import type {MarkdownCodeBlockArtifact} from '../../../../utils/markdownCodeBlockPlugin';
import {CodeBlockActionsPortals} from '../CodeBlockActionsPortals';
import type {MarkdownCodeBlockActionsConfig} from '../MarkdownRenderer';

const modernHtml = [
    '<div class="yfm-code-floating-container" data-aikit-code-block>',
    '<pre><code>SELECT 1;</code></pre>',
    '<div class="yfm-code-floating">',
    '<button aria-label="Copy"></button><button aria-label="Wrap"></button>',
    '</div>',
    '</div>',
].join('');

const legacyHtml = [
    '<div class="yfm-clipboard" data-aikit-code-block>',
    '<pre><code>SELECT 1;</code></pre>',
    '<button class="yfm-clipboard-button" aria-label="Copy"></button>',
    '</div>',
].join('');

const twoModernBlocksHtml = modernHtml + modernHtml.replace('SELECT 1;', 'SELECT 2;');

interface PortalHarnessProps {
    codeBlocks: MarkdownCodeBlockArtifact[];
    config?: MarkdownCodeBlockActionsConfig;
    html: string;
}

function PortalHarness({codeBlocks, config, html}: PortalHarnessProps) {
    const refCtr = useRef<HTMLDivElement>(null);

    return (
        <div>
            <div ref={refCtr} dangerouslySetInnerHTML={{__html: html}} />
            {config ? (
                <CodeBlockActionsPortals
                    codeBlocks={codeBlocks}
                    config={config}
                    html={html}
                    refCtr={refCtr}
                />
            ) : null}
        </div>
    );
}

describe('CodeBlockActionsPortals', () => {
    test('mounts metadata-aware actions before modern and legacy native controls', () => {
        const codeBlock = {code: 'SELECT 1;', language: 'sql'};

        for (const html of [modernHtml, legacyHtml]) {
            const handleAction = jest.fn();
            const {container, unmount} = render(
                <PortalHarness
                    codeBlocks={[codeBlock]}
                    config={{
                        render: (block) => (
                            <button type="button" onClick={() => handleAction(block)}>
                                Open
                            </button>
                        ),
                    }}
                    html={html}
                />,
            );

            fireEvent.click(screen.getByRole('button', {name: 'Open'}));
            expect(handleAction).toHaveBeenCalledWith({...codeBlock, index: 0});

            const actionMount = container.querySelector(
                '.g-aikit-markdown-renderer__code-block-actions',
            );
            expect(actionMount?.nextElementSibling).toHaveAttribute('aria-label', 'Copy');

            unmount();
        }
    });

    test('applies always visibility only to rendered actions and fails closed on mismatch', () => {
        const codeBlocks = [
            {code: 'SELECT 1;', language: 'sql'},
            {code: 'SELECT 2;', language: 'yql'},
        ];
        const config: MarkdownCodeBlockActionsConfig = {
            render: ({index}) => (index === 1 ? <button type="button">Open</button> : null),
            visibility: 'always',
        };
        const {container, rerender} = render(
            <PortalHarness codeBlocks={codeBlocks} config={config} html={twoModernBlocksHtml} />,
        );

        const renderedBlocks = container.querySelectorAll('[data-aikit-code-block]');
        expect(renderedBlocks[0].className).not.toContain('actionsVisible');
        expect(renderedBlocks[1].className).toContain('actionsVisible');
        expect(screen.getByRole('button', {name: 'Open'})).toBeInTheDocument();
        expect(screen.getAllByRole('button', {name: 'Copy'})).toHaveLength(2);
        expect(screen.getAllByRole('button', {name: 'Wrap'})).toHaveLength(2);

        rerender(
            <PortalHarness
                codeBlocks={codeBlocks.slice(0, 1)}
                config={config}
                html={twoModernBlocksHtml}
            />,
        );

        expect(screen.queryByRole('button', {name: 'Open'})).not.toBeInTheDocument();
        expect(container.querySelector('[class*="actionsVisible"]')).toBeNull();
        expect(
            container.querySelector('.g-aikit-markdown-renderer__code-block-actions'),
        ).toBeNull();
    });

    test('replaces stale handlers and removes service markup when disabled', () => {
        const codeBlocks = [{code: 'SELECT 1;', language: 'sql'}];
        const firstHandler = jest.fn();
        const latestHandler = jest.fn();
        const {container, rerender} = render(
            <PortalHarness
                codeBlocks={codeBlocks}
                config={{render: () => <button onClick={firstHandler}>First</button>}}
                html={modernHtml}
            />,
        );

        rerender(
            <PortalHarness
                codeBlocks={codeBlocks}
                config={{render: () => <button onClick={latestHandler}>Latest</button>}}
                html={modernHtml}
            />,
        );

        expect(screen.queryByRole('button', {name: 'First'})).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', {name: 'Latest'}));
        expect(firstHandler).not.toHaveBeenCalled();
        expect(latestHandler).toHaveBeenCalledTimes(1);

        rerender(<PortalHarness codeBlocks={codeBlocks} html={modernHtml} />);

        expect(screen.queryByRole('button', {name: 'Latest'})).not.toBeInTheDocument();
        expect(
            container.querySelector('.g-aikit-markdown-renderer__code-block-actions'),
        ).toBeNull();
        expect(container.querySelector('[class*="markdown-renderer__code-block"]')).toBeNull();
        expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
    });
});
