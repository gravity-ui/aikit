import type {ReactElement} from 'react';

import {Provider, ThemeProvider, configure} from '@gravity-ui/uikit';
import '@testing-library/jest-dom';
import {act, fireEvent, render as renderView, screen, waitFor} from '@testing-library/react';

import {
    AgentChat,
    AgentComposer,
    type AgentComposerProps,
    ChangedFilesSummary,
    RunActivity,
    ScrollToBottomButton,
} from '..';
import {MarkdownProvider} from '../../markdown/MarkdownProvider';
import type {MarkdownRendererProps} from '../../markdown/types';

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

it('keeps the draft intact when the caret leaves a slash command', () => {
    const onSend = jest.fn().mockResolvedValue(undefined);
    render(<AgentChat messages={[]} composer={<AgentComposer {...composerProps({onSend})} />} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(input, {target: {value: 'Please /rev'}});
    input.setSelectionRange(0, 0);
    fireEvent.keyDown(input, {key: 'Tab'});
    expect(input).toHaveValue('Please /rev');
    expect(onSend).not.toHaveBeenCalled();
    input.setSelectionRange(11, 11);
    fireEvent.select(input);
    fireEvent.keyDown(input, {key: 'Tab'});
    expect(input).toHaveValue('Please /review ');
    expect(input.selectionStart).toBe('Please /review '.length);

    fireEvent.change(input, {target: {value: 'Please /rev after this'}});
    fireEvent.select(input);
    input.setSelectionRange(11, 11);
    fireEvent.select(input);
    fireEvent.keyDown(input, {key: 'Tab'});
    expect(input).toHaveValue('Please /review  after this');

    fireEvent.change(input, {target: {value: 'Please /rev'}});
    input.setSelectionRange(7, 11);
    fireEvent.keyDown(input, {key: 'Tab'});
    expect(input).toHaveValue('Please /rev');
});

it('selects the navigated skill from the button menu and from slash autocomplete', async () => {
    const props = composerProps({skills: [{slug: 'review'}, {slug: 'release'}]});
    render(<AgentChat messages={[]} composer={<AgentComposer {...props} />} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.click(screen.getByRole('button', {name: 'Select skill'}));
    const first = await screen.findByRole('option', {name: /review/});
    act(() => first.focus());
    fireEvent.keyDown(first, {key: 'ArrowDown'});
    const second = screen.getByRole('option', {name: /release/});
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, {key: 'Enter'});
    expect(input).toHaveValue('/release ');
    expect(input).toHaveFocus();

    fireEvent.change(input, {target: {value: '/re'}});
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    fireEvent.keyDown(input, {key: 'Tab'});
    expect(input).toHaveValue('/release ');

    input.setSelectionRange(0, input.value.length);
    fireEvent.select(input);
    fireEvent.click(screen.getByRole('button', {name: 'Select skill'}));
    fireEvent.click(await screen.findByRole('option', {name: /release/}));
    expect(input).toHaveValue('/release ');
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(input.value.length);
    expect(input.selectionEnd).toBe(input.value.length);
});

it('inherits message Markdown settings in run steps and keeps step overrides', () => {
    const renderer = jest.fn((props: MarkdownRendererProps) => <p>{props.content}</p>);
    const mdxOptions = {components: {}};
    const stepContext = {scope: 'step'};
    const transformOptions = {breaks: false};
    const mermaidOptions = {load: jest.fn()};
    const extraProps = {title: 'Message Markdown'};
    const messages = [{id: 'first', role: 'assistant' as const, content: 'Final answer'}];
    function View({newTab}: {newTab: boolean}) {
        return (
            <MarkdownProvider renderer={renderer}>
                <AgentChat
                    messages={messages}
                    composer={null}
                    openMarkdownLinksInNewTab={newTab}
                    transformOptions={transformOptions}
                    mermaidOptions={mermaidOptions}
                    mdxProps={{
                        mdxOptions,
                        getMdxContext: (message) => ({messageId: message.id}),
                        getMarkdownExtraProps: () => extraProps,
                    }}
                    runs={[
                        {
                            messageId: 'first',
                            activity: {
                                id: 'run',
                                state: 'completed',
                                durationMs: 1000,
                                defaultExpanded: true,
                                steps: [
                                    {
                                        id: 'inherited',
                                        kind: 'thinking',
                                        props: {content: 'Inherited thinking', status: 'thought'},
                                    },
                                    {
                                        id: 'override',
                                        kind: 'thinking',
                                        props: {
                                            content: 'Overridden thinking',
                                            status: 'thought',
                                            mdxContext: stepContext,
                                            openMarkdownLinksInNewTab: false,
                                        },
                                    },
                                    {
                                        id: 'plain',
                                        kind: 'thinking',
                                        props: {
                                            content: 'Plain thinking',
                                            status: 'thought',
                                            format: 'plain',
                                        },
                                    },
                                ],
                            },
                        },
                    ]}
                />
            </MarkdownProvider>
        );
    }
    const {rerender} = render(<View newTab />);
    const expectContent = (content: string, props: Partial<MarkdownRendererProps>) => {
        expect(renderer).toHaveBeenCalledWith(
            expect.objectContaining({content, ...props}),
            expect.anything(),
        );
    };
    expectContent('Final answer', {openLinksInNewTab: true, mdxContext: {messageId: 'first'}});
    expectContent('Inherited thinking', {
        openLinksInNewTab: true,
        mdxContext: {messageId: 'first'},
        mdxOptions,
        mermaidOptions,
        extraProps,
        transformOptions: expect.objectContaining(transformOptions),
    });
    expectContent('Overridden thinking', {openLinksInNewTab: false, mdxContext: stepContext});
    expect(renderer.mock.calls.some(([props]) => props.content === 'Plain thinking')).toBe(false);
    renderer.mockClear();
    rerender(<View newTab={false} />);
    expectContent('Inherited thinking', {
        openLinksInNewTab: false,
        mdxContext: {messageId: 'first'},
    });
});

it('keeps non-expandable tool content visible inside activity', () => {
    render(
        <AgentChat
            messages={[{id: 'answer', role: 'assistant', content: 'Done'}]}
            composer={null}
            runs={[
                {
                    messageId: 'answer',
                    activity: {
                        id: 'run',
                        state: 'completed',
                        durationMs: 1000,
                        defaultExpanded: true,
                        steps: [
                            {
                                id: 'tool',
                                kind: 'tool',
                                props: {
                                    toolName: 'Fixed result',
                                    expandable: false,
                                    initialExpanded: true,
                                    bodyContent: <p>Always visible result</p>,
                                },
                            },
                        ],
                    },
                },
            ]}
        />,
    );
    expect(screen.queryByRole('button', {name: 'Fixed result'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Fixed result'));
    expect(screen.getByText('Always visible result')).toBeVisible();
});

it('updates experimental labels when the provider language changes', () => {
    function View({lang}: {lang: 'en' | 'ru'}) {
        return (
            <Provider lang={lang}>
                <AgentChat messages={[]} composer={<AgentComposer {...composerProps()} />} />
                <RunActivity id="locale" steps={[]} state="completed" durationMs={1000} />
                <ChangedFilesSummary
                    files={[{id: 'file', path: 'app.ts', added: 1, deleted: 0}]}
                    view="card"
                    onUndo={() => {}}
                />
                <ScrollToBottomButton />
            </Provider>
        );
    }
    const {rerender} = render(<View lang="ru" />);
    expect(screen.getByRole('button', {name: 'Работа заняла 1 с'})).toBeVisible();
    expect(screen.getByPlaceholderText(/Планируйте/)).toBeVisible();
    expect(screen.queryByRole('button', {name: 'Undo'})).not.toBeInTheDocument();
    rerender(<View lang="en" />);
    expect(screen.getByRole('button', {name: 'Worked for 1 s'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Undo'})).toBeVisible();
});

function renderStreamingChat() {
    const view = (content: string, historyKey?: string) => (
        <AgentChat
            messages={[{id: 'answer', role: 'assistant', content}]}
            composer={null}
            status="streaming"
            historyKey={historyKey}
        />
    );
    const {container, rerender} = render(view('Initial response'));
    const viewport = container.querySelector(
        '.g-aikit-chat-content-v2__viewport',
    ) as HTMLDivElement;
    let height = 1200;
    let top = 100;
    let animationTarget = 0;
    const clamp = (value: number) => Math.max(0, Math.min(value, height - 400));
    Object.defineProperties(viewport, {
        scrollHeight: {get: () => height, configurable: true},
        clientHeight: {value: 400, configurable: true},
        scrollTop: {
            get: () => top,
            set: (value: number) => {
                top = clamp(value);
            },
            configurable: true,
        },
    });
    const scrollTo = jest.fn((options?: ScrollToOptions | number, y?: number) => {
        const {top: destination, behavior} =
            typeof options === 'number' ? {top: y} : (options ?? {});
        if (behavior === 'smooth') {
            animationTarget = clamp(destination ?? 0);
        } else {
            viewport.scrollTop = destination ?? 0;
        }
    });
    viewport.scrollTo = scrollTo;
    fireEvent.scroll(viewport);
    rerender(view('Initial response'));
    return {
        viewport,
        scrollTo,
        append(content: string, nextHeight: number, historyKey?: string) {
            height = nextHeight;
            rerender(view(content, historyKey));
        },
        finishAnimation() {
            viewport.scrollTop = animationTarget;
            fireEvent.scroll(viewport);
        },
    };
}

it.each([false, true])(
    'resumes following streamed content with reduced motion=%s',
    (reducedMotion) => {
        const previousMatchMedia = window.matchMedia;
        const media = window.matchMedia('');
        window.matchMedia = jest.fn().mockReturnValue({...media, matches: reducedMotion});
        try {
            const chat = renderStreamingChat();
            fireEvent.click(screen.getByRole('button', {name: 'Scroll to bottom'}));
            expect(chat.scrollTo).toHaveBeenCalledWith({
                top: 1200,
                behavior: reducedMotion ? 'auto' : 'smooth',
            });
            chat.append('More content during scrolling', 1600);
            if (!reducedMotion) {
                expect(chat.viewport.scrollTop).toBe(100);
                chat.finishAnimation();
            }
            expect(chat.viewport.scrollTop).toBe(1200);
            expect(
                screen.queryByRole('button', {name: 'Scroll to bottom'}),
            ).not.toBeInTheDocument();
            chat.append('Response keeps streaming after arrival', 1700);
            expect(chat.viewport.scrollTop).toBe(1300);
        } finally {
            window.matchMedia = previousMatchMedia;
        }
    },
);

it.each(['wheel', 'touch', 'pointer', 'keyboard'])(
    'allows %s input to interrupt scrolling to latest',
    (input) => {
        const chat = renderStreamingChat();
        fireEvent.click(screen.getByRole('button', {name: 'Scroll to bottom'}));
        chat.viewport.scrollTop = 400;
        fireEvent.scroll(chat.viewport);
        switch (input) {
            case 'wheel':
                fireEvent.wheel(chat.viewport, {deltaY: -100});
                break;
            case 'touch':
                fireEvent.touchStart(chat.viewport);
                break;
            case 'pointer':
                fireEvent.pointerDown(chat.viewport);
                break;
            case 'keyboard':
                fireEvent.keyDown(chat.viewport, {key: 'PageUp'});
                break;
        }
        expect(chat.scrollTo).toHaveBeenLastCalledWith({top: 400, behavior: 'auto'});
        chat.append('New content after user interruption', 1600);
        expect(chat.viewport.scrollTop).toBe(400);
        expect(screen.getByRole('button', {name: 'Scroll to bottom'})).toBeVisible();
    },
);

it('preserves history position when older messages arrive during scrolling to latest', () => {
    const chat = renderStreamingChat();
    fireEvent.click(screen.getByRole('button', {name: 'Scroll to bottom'}));
    chat.append('Older messages prepended', 1600, 'older');
    expect(chat.scrollTo).toHaveBeenLastCalledWith({top: 100, behavior: 'auto'});
    expect(chat.viewport.scrollTop).toBe(500);
    chat.append('More streamed content', 1700, 'older');
    expect(chat.viewport.scrollTop).toBe(500);
});
