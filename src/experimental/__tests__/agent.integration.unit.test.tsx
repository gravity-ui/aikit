import '@testing-library/jest-dom';
import {act, fireEvent, render as renderView, screen, waitFor} from '@testing-library/react';
import type {ReactElement} from 'react';
import {configure, ThemeProvider} from '@gravity-ui/uikit';

import {MarkdownProvider} from '../../markdown/MarkdownProvider';
import type {MarkdownRendererProps} from '../../markdown/types';
import {
    AgentChat,
    AgentComposer,
    type AgentComposerProps,
    ChangedFilesSummary,
    RunActivity,
} from '..';

// The host renderer boundary is independent of the bundled Markdown engine.
jest.mock('../../components/atoms/MarkdownRenderer', () => ({
    MarkdownRenderer: (props: MarkdownRendererProps) => <p>{props.content}</p>,
}));
jest.mock('uuid', () => ({v4: () => 'test-id'}));

const render = (ui: ReactElement) => renderView(ui, {wrapper: ThemeProvider});

const originalResizeObserver = global.ResizeObserver;
const originalMatchMedia = window.matchMedia;
beforeAll(() => {
    global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
    }));
    configure({lang: 'en'});
});
afterAll(() => {
    global.ResizeObserver = originalResizeObserver;
    window.matchMedia = originalMatchMedia;
});

function composerProps(overrides: Partial<AgentComposerProps> = {}): AgentComposerProps {
    return {
        models: [{id: 'default', name: 'Default model'}],
        model: 'default',
        onModelChange: jest.fn(),
        repositories: [],
        repository: {orgSlug: '', repoSlug: ''},
        onRepositoryChange: jest.fn(),
        skills: [{slug: 'review'}],
        status: 'ready',
        onSend: jest.fn().mockResolvedValue(undefined),
        onStop: jest.fn(),
        ...overrides,
    };
}

it('restores a rejected draft through the real prompt and permits a successful retry', async () => {
    const onSend = jest
        .fn()
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce(undefined);
    render(<AgentChat messages={[]} composer={<AgentComposer {...composerProps({onSend})} />} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'Please review this change'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
    await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('draft has been restored'),
    );
    expect(input).toHaveValue('Please review this change');
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(2));
    expect(input).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('keeps IME confirmation and slash completion separate from sending', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined);
    render(<AgentChat messages={[]} composer={<AgentComposer {...composerProps({onSend})} />} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: '/rev'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter', isComposing: true});
    expect(input).toHaveValue('/rev');
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
    expect(input).toHaveValue('/review ');
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter', ctrlKey: true});
    expect(input).toHaveValue('/review \n');
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
    await waitFor(() => expect(onSend).toHaveBeenCalledWith({content: '/review'}));
});

it('does not restore a failed request into a different conversation', async () => {
    let reject: (reason: Error) => void = () => {};
    const onSend = jest.fn(
        () =>
            new Promise<void>((_resolve, rejectSend) => {
                reject = rejectSend;
            }),
    );
    const props = composerProps({onSend});
    const {rerender} = render(
        <AgentChat messages={[]} composer={<AgentComposer {...props} resetKey="first" />} />,
    );
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'First chat draft'}});
    fireEvent.keyDown(screen.getByRole('textbox'), {key: 'Enter', code: 'Enter'});
    rerender(<AgentChat messages={[]} composer={<AgentComposer {...props} resetKey="second" />} />);
    await act(async () => {
        reject(new Error('offline'));
    });
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('preserves host Markdown options and disclosure when activity icons are toggled', () => {
    const renderer = jest.fn((props: MarkdownRendererProps) => <p>{props.content}</p>);
    const mdxContext = {project: 'demo'};
    const steps = [
        {
            id: 'thinking',
            kind: 'thinking' as const,
            props: {
                status: 'thought' as const,
                content: 'Inspect source',
                format: 'markdown' as const,
                mdxContext,
                openMarkdownLinksInNewTab: true,
            },
        },
        {
            id: 'read',
            kind: 'tool' as const,
            props: {
                toolName: 'Read source',
                status: 'success' as const,
                bodyContent: <p>File contents</p>,
            },
        },
    ];
    function View({showIcon}: {showIcon: boolean}) {
        return (
            <MarkdownProvider renderer={renderer}>
                <RunActivity
                    id="run"
                    steps={steps}
                    state="completed"
                    durationMs={3000}
                    showIcon={showIcon}
                />
            </MarkdownProvider>
        );
    }
    const {container, rerender} = render(<View showIcon />);
    fireEvent.click(screen.getByRole('button', {name: 'Worked for 3 s'}));
    expect(renderer).toHaveBeenCalledWith(
        expect.objectContaining({content: 'Inspect source', mdxContext, openLinksInNewTab: true}),
        expect.anything(),
    );
    expect(container.querySelectorAll('.g-aikit-compact-row__icon')).toHaveLength(3);
    rerender(<View showIcon={false} />);
    expect(container.querySelectorAll('.g-aikit-compact-row__icon')).toHaveLength(0);
    expect(screen.getByRole('button', {name: 'Worked for 3 s'})).toHaveAttribute(
        'aria-expanded',
        'true',
    );
    expect(screen.getByRole('button', {name: 'Read source'})).toBeVisible();
    rerender(<View showIcon />);
    expect(container.querySelectorAll('.g-aikit-compact-row__icon')).toHaveLength(3);
});

it('keeps file actions attached to their assistant response and delegates undo to the host', async () => {
    const undo = jest.fn();
    const openFile = jest.fn();
    const file = {id: 'file', path: 'src/App.tsx', added: 3, deleted: 1};
    render(
        <AgentChat
            messages={[{id: 'answer', role: 'assistant', content: 'Updated the app'}]}
            composer={null}
            renderAssistantFooter={() => (
                <ChangedFilesSummary
                    files={[file]}
                    view="card"
                    onUndo={undo}
                    onFileClick={openFile}
                />
            )}
        />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Undo'}));
    expect(undo).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', {name: /1 file changed/}));
    fireEvent.click(await screen.findByRole('button', {name: /src\/App.tsx/}));
    expect(openFile).toHaveBeenCalledWith(file);
    expect(screen.getByText('Updated the app')).toBeVisible();
});
