import {useEffect, useRef, useState} from 'react';

import {
    ArrowRotateLeft,
    ChevronLeft,
    ChevronRight,
    ForwardStep,
    Pause,
    Play,
} from '@gravity-ui/icons';
import {Button, Icon, SegmentedRadioGroup, Select, Text} from '@gravity-ui/uikit';

import {AgentChat, type AgentRunContent} from '../..';
import type {
    ChatStatus,
    DefaultMessageAction,
    TAssistantMessage,
    TChatMessage,
    TDefaultMessageContent,
    TSubmitData,
    TUserMessage,
    UserRating,
} from '../../../../../types';
import {BaseMessageActionType} from '../../../../../types';
import {copyToClipboard} from '../../../../../utils/clipboardUtils';
import {ScrollToBottomButton} from '../../../../atoms/ScrollToBottomButton';
import {EmptyContainer} from '../../../../templates/EmptyContainer';
import {ChatContainer} from '../../../ChatContainer';

import {useAgentActivity} from './AgentActivity';
import {AgentComposer} from './AgentComposer';
import {ChangedFilesResponse} from './ChangedFilesResponse';
import {FixtureChangesSummary} from './FixtureChangesSummary';
import {getDeveloperChanges} from './changedFilesFixture';
import {
    developerCommentary,
    developerPrompt,
    developerReasoning,
    developerResponse,
    developerSteps,
    stepIcon,
} from './developerFlow';
import {stopRunMessages} from './stopRunMessages';
import {useAgentChrome} from './useAgentChrome';
import {useScrollToLatest} from './useScrollToLatest';

import './ChatPlayground.scss';

type Scenario = 'success' | 'tool-error' | 'generation-error';

export function ChatPlayground() {
    const [messages, setMessages] = useState<TChatMessage[]>([]);
    const [status, setStatus] = useState<ChatStatus>('ready');
    const [error, setError] = useState<Error>();
    const [scenario, setScenario] = useState<Scenario>('success');
    const [skin, setSkin] = useState('agent');
    const [speed, setSpeed] = useState('1');
    const [phase, setPhase] = useState('Ready');
    const [paused, setPaused] = useState(false);
    const [playbackStep, setPlaybackStep] = useState(-1);
    const replayContext = useRef<{
        messages: TChatMessage[];
        content: string;
        retry: boolean;
        scenario: Scenario;
    }>();
    const playbackRef = useRef<{
        pausedAt?: number;
        pausedDuration: number;
        skip: boolean;
        seekTarget?: number;
        continueConfirmation?: () => void;
    }>({pausedDuration: 0, skip: false});
    const runRef = useRef<AbortController | null>(null);
    const sequenceRef = useRef(0);
    const lastPrompt = useRef('');
    const chrome = useAgentChrome();
    const [savedChats, setSavedChats] = useState<
        Array<{id: string; name: string; createTime: string; messages: TChatMessage[]}>
    >([]);
    const [activeChatId, setActiveChatId] = useState('current');
    const chatRef = useRef<HTMLDivElement>(null);
    const scrollControl = useScrollToLatest(chatRef, skin === 'standard');
    const agent = useAgentActivity(messages);
    const changes = getDeveloperChanges(messages, status);

    useEffect(() => () => runRef.current?.abort(), []);

    const togglePause = () => {
        const playback = playbackRef.current;
        playback.seekTarget = undefined;
        if (playback.pausedAt === undefined) {
            playback.pausedAt = performance.now();
        } else {
            playback.pausedDuration += performance.now() - playback.pausedAt;
            playback.pausedAt = undefined;
        }
        setPaused(playback.pausedAt !== undefined);
        const snapshot = {...playback};
        setMessages((previous) =>
            previous.map((message) =>
                message.metadata?.activityState === 'running'
                    ? {
                          ...message,
                          metadata: {
                              ...message.metadata,
                              activityPausedAt: snapshot.pausedAt,
                              activityPausedDuration: snapshot.pausedDuration,
                          },
                      }
                    : message,
            ),
        );
    };

    const skipToEnd = () => {
        const playback = playbackRef.current;
        if (playback.pausedAt !== undefined) {
            playback.pausedDuration += performance.now() - playback.pausedAt;
            playback.pausedAt = undefined;
        }
        playback.seekTarget = undefined;
        playback.skip = true;
        setPaused(false);
        playback.continueConfirmation?.();
    };

    const stop = () => {
        const playback = playbackRef.current;
        if (playback.pausedAt !== undefined) {
            playback.pausedDuration += performance.now() - playback.pausedAt;
            playback.pausedAt = undefined;
        }
        setPaused(false);
        runRef.current?.abort();
        runRef.current = null;
        const finishedAt = performance.now();
        const snapshot = stopRunMessages(messages, finishedAt, playback.pausedDuration);
        setMessages((previous) => stopRunMessages(previous, finishedAt, playback.pausedDuration));
        setStatus('ready');
        setPhase('Stopped');
        return snapshot;
    };

    const reset = () => {
        stop();
        setMessages([]);
        replayContext.current = undefined;
        playbackRef.current = {pausedDuration: 0, skip: false};
        setPlaybackStep(-1);
        setError(undefined);
        lastPrompt.current = '';
        setPhase('Ready');
    };

    const send = async ({content}: TSubmitData, retry = false, seekTarget?: number) => {
        if (runRef.current || !content.trim()) return;
        const controller = new AbortController();
        runRef.current = controller;
        const context =
            seekTarget === undefined || !replayContext.current
                ? {messages: [...messages], content, retry, scenario}
                : replayContext.current;
        if (!context) return;
        replayContext.current = context;
        const runScenario = context.scenario;
        let checkpoint = -1;
        playbackRef.current = {pausedDuration: 0, skip: false, seekTarget};
        setPlaybackStep(-1);
        setPaused(false);
        lastPrompt.current = content;
        const id = `demo-${++sequenceRef.current}`;
        const parts: TDefaultMessageContent[] = [];
        const activityStartedAt = performance.now();
        let activityFinishedAt: number | undefined;
        let responseCompleted = false;
        const update = () => {
            if (controller.signal.aborted) return;
            setMessages((previous) =>
                previous.map((message) =>
                    message.role === 'assistant' && message.id === id
                        ? {
                              ...message,
                              content: [...parts],
                              metadata: {
                                  activityStartedAt,
                                  activityFinishedAt,
                                  activityPausedAt: activityFinishedAt
                                      ? undefined
                                      : playbackRef.current.pausedAt,
                                  activityPausedDuration: playbackRef.current.pausedDuration,
                                  activityState: activityFinishedAt ? 'completed' : 'running',
                                  responseState: responseCompleted ? 'completed' : 'running',
                              },
                          }
                        : message,
                ),
            );
        };
        const wait = (ms: number, checkpointEnabled = true) =>
            new Promise<void>((resolve, reject) => {
                // Checkpoints follow visible states, not individual streamed words.
                if (checkpointEnabled) {
                    checkpoint += 1;
                    setPlaybackStep(checkpoint);
                    if (playbackRef.current.seekTarget === checkpoint) {
                        playbackRef.current.pausedAt = performance.now();
                        setPaused(true);
                        setMessages((previous) =>
                            previous.map((message) =>
                                message.id === id && message.metadata?.activityState === 'running'
                                    ? {
                                          ...message,
                                          metadata: {
                                              ...message.metadata,
                                              activityPausedAt: playbackRef.current.pausedAt,
                                          },
                                      }
                                    : message,
                            ),
                        );
                    }
                }
                const target = playbackRef.current.seekTarget;
                if (target !== undefined && checkpoint < target) {
                    resolve();
                    return;
                }
                if (controller.signal.aborted) {
                    reject(new DOMException('Stopped', 'AbortError'));
                    return;
                }
                if (playbackRef.current.skip) {
                    resolve();
                    return;
                }
                let remaining = ms / Number(speed);
                let previous = performance.now();
                const cleanup = () => {
                    window.clearInterval(timer);
                    controller.signal.removeEventListener('abort', abort);
                };
                const abort = () => {
                    cleanup();
                    reject(new DOMException('Stopped', 'AbortError'));
                };
                const timer = window.setInterval(() => {
                    const now = performance.now();
                    if (playbackRef.current.pausedAt === undefined) remaining -= now - previous;
                    previous = now;
                    if (
                        playbackRef.current.skip ||
                        (playbackRef.current.pausedAt === undefined && remaining <= 0)
                    ) {
                        cleanup();
                        resolve();
                    }
                }, 20);
                controller.signal.addEventListener('abort', abort, {once: true});
            });
        setError(undefined);
        setStatus('submitted');
        setPhase('Waiting');
        setMessages((previous) => [
            ...(seekTarget === undefined ? previous : context.messages),
            ...(context.retry
                ? []
                : [
                      {
                          id: `${id}-user`,
                          role: 'user' as const,
                          content,
                          timestamp: new Date().toISOString(),
                      },
                  ]),
        ]);
        try {
            await wait(700);
            setStatus('streaming');
            setPhase('Thinking');
            parts.push({
                id: `${id}-reasoning`,
                type: 'thinking',
                data: {
                    title: 'Planning the response',
                    status: 'thinking',
                    defaultExpanded: true,
                    content: developerReasoning,
                },
            });
            setMessages((previous) => [
                ...previous,
                {
                    id,
                    role: 'assistant',
                    timestamp: new Date().toISOString(),
                    content: [...parts],
                    metadata: {
                        activityStartedAt,
                        activityState: 'running',
                        responseState: 'running',
                    },
                },
            ]);
            await wait(1800);
            parts[0] = {
                id: `${id}-reasoning`,
                type: 'thinking',
                data: {
                    title: 'Plan ready',
                    status: 'thought',
                    defaultExpanded: true,
                    content: developerReasoning,
                },
            };
            let failed = false;
            for (const [stepIndex, step] of developerSteps.entries()) {
                const partIndex = parts.length;
                const data = {
                    toolName: step.name,
                    demoContext: {target: step.target, ...step.compactContext},
                    toolIcon: stepIcon(step.icon),
                    headerContent: step.target,
                    bodyContent: step.body,
                    footerContent: step.tool,
                    initialExpanded: true,
                    autoCollapseOnSuccess: true,
                };
                parts.push({
                    id: `${id}-tool-${stepIndex}`,
                    type: 'tool',
                    data: {...data, status: 'loading'},
                });
                setPhase(`Tool ${stepIndex + 1} / ${developerSteps.length}`);
                update();
                await wait(2600);
                if ('confirmation' in step) {
                    setPhase('Waiting for confirmation');
                    // Seeking may cross approval in this local simulation only.
                    parts[partIndex] = {
                        id: `${id}-tool-${stepIndex}`,
                        type: 'tool',
                        data: {...data, status: 'waitingConfirmation'},
                    };
                    update();
                    const seekingPastApproval =
                        playbackRef.current.seekTarget !== undefined &&
                        checkpoint < playbackRef.current.seekTarget;
                    if (!seekingPastApproval && !playbackRef.current.skip) {
                        setPhase('Waiting for confirmation');
                        await new Promise<void>((resolve, reject) => {
                            const abort = () => {
                                playbackRef.current.continueConfirmation = undefined;
                                reject(new DOMException('Stopped', 'AbortError'));
                            };
                            const accept = () => {
                                playbackRef.current.continueConfirmation = undefined;
                                controller.signal.removeEventListener('abort', abort);
                                resolve();
                            };
                            playbackRef.current.continueConfirmation = accept;
                            controller.signal.addEventListener('abort', abort, {once: true});
                            parts[partIndex] = {
                                id: `${id}-tool-${stepIndex}`,
                                type: 'tool',
                                data: {
                                    ...data,
                                    status: 'waitingConfirmation',
                                    onAccept: accept,
                                    onReject: stop,
                                },
                            };
                            update();
                        });
                    }
                    if (controller.signal.aborted) return;
                }
                if (runScenario === 'tool-error' && step.tool === 'repo_code_search') {
                    failed = true;
                    parts[partIndex] = {
                        id: `${id}-tool-${stepIndex}`,
                        type: 'tool',
                        data: {
                            ...data,
                            status: 'error',
                            headerContent: 'Search service timed out',
                            bodyContent:
                                'Repository search is temporarily unavailable. Continuing with the catalog paths from the directory listing.',
                        },
                    };
                } else {
                    parts[partIndex] = {
                        id: `${id}-tool-${stepIndex}`,
                        type: 'tool',
                        data: {
                            ...data,
                            status: 'success',
                            headerContent: step.summary,
                        },
                    };
                }
                setPhase(
                    `Tool ${stepIndex + 1} / ${developerSteps.length} · ${
                        runScenario === 'tool-error' && step.tool === 'repo_code_search'
                            ? 'Error'
                            : 'Completed'
                    }`,
                );
                update();
                await wait(700);
                if (developerCommentary[stepIndex]) {
                    setPhase('Commentary');
                    parts.push({
                        id: `${id}-commentary-${stepIndex}`,
                        type: 'text',
                        data: {
                            text: developerCommentary[stepIndex],
                        },
                    });
                    update();
                    await wait(900);
                }
            }
            activityFinishedAt = performance.now();
            update();
            setPhase('Streaming');
            await wait(0);
            const response = developerResponse(failed);
            const chunks = response.match(/\S+\s*/g) || [];
            const textIndex = parts.length;
            for (let index = 0; index < chunks.length; index++) {
                if (index === 30) await wait(0);
                await wait(25, false);
                if (runScenario === 'generation-error' && index === 30) {
                    throw new Error(
                        'Generation interrupted. This is a simulated connection error. Retry to run the scenario again.',
                    );
                }
                parts[textIndex] = {
                    id: 'demo-answer',
                    type: 'text',
                    data: {text: chunks.slice(0, index + 1).join('')},
                };
                update();
            }
            responseCompleted = true;
            update();
            setStatus('ready');
            setPhase(failed ? 'Completed with tool error' : 'Completed');
            await wait(0);
        } catch (caught) {
            if (!controller.signal.aborted) {
                setError(caught instanceof Error ? caught : new Error('Demo failed'));
                setMessages((previous) =>
                    previous.map((message) =>
                        message.id === id
                            ? {
                                  ...message,
                                  metadata: {
                                      ...message.metadata,
                                      activityState: 'error',
                                      responseState: 'error',
                                      activityFinishedAt: performance.now(),
                                  },
                              }
                            : message,
                    ),
                );
                setStatus('error');
                setPhase('Generation error');
            }
        } finally {
            if (runRef.current === controller) {
                runRef.current = null;
                playbackRef.current.continueConfirmation = undefined;
                setPaused(false);
            }
        }
    };

    const seekStep = (target: number) => {
        const context = replayContext.current;
        if (target < 0) return;
        if (!context) {
            send({content: developerPrompt}, false, 0);
            return;
        }
        runRef.current?.abort();
        runRef.current = null;
        send({content: context.content}, context.retry, target);
    };

    const rateAnswer = (id: string | undefined, rating: UserRating) => {
        setMessages((previous) =>
            previous.map((message) =>
                message.role === 'assistant' && message.id === id
                    ? {...message, userRating: message.userRating === rating ? undefined : rating}
                    : message,
            ),
        );
    };
    const userActions: DefaultMessageAction<TUserMessage>[] = [
        {
            type: BaseMessageActionType.Copy,
            onClick: (message) => copyToClipboard(message.content),
        },
    ];
    const assistantActions: DefaultMessageAction<TAssistantMessage<AgentRunContent>>[] = [
        {
            type: BaseMessageActionType.Copy,
            onClick: (message) => {
                const content =
                    typeof message.content === 'string'
                        ? message.content
                        : (Array.isArray(message.content) ? message.content : [message.content])
                              .filter((part) => part.type === 'text' && part.id === 'demo-answer')
                              .flatMap((part) => (part.type === 'text' ? [part.data.text] : []));
                copyToClipboard(content);
            },
        },
        {
            type: BaseMessageActionType.Retry,
            onClick: (message) => {
                if (runRef.current) return;
                const index = messages.findIndex((item) => item.id === message.id);
                if (index < 0) return;
                const prompt = messages
                    .slice(0, index)
                    .reverse()
                    .find((item) => item.role === 'user');
                if (prompt?.role !== 'user') return;
                setMessages((previous) => previous.slice(0, index));
                send({content: prompt.content}, true);
            },
        },
        {type: BaseMessageActionType.Like, onClick: (message) => rateAnswer(message.id, 'like')},
        {
            type: BaseMessageActionType.Dislike,
            onClick: (message) => rateAnswer(message.id, 'dislike'),
        },
    ];

    const busy = status === 'submitted' || status === 'streaming';
    return (
        <div className="chat-playground">
            <div className="chat-playground__toolbar">
                <Text variant="subheader-2">Chat Playground</Text>
                <SegmentedRadioGroup
                    aria-label="Skin"
                    value={skin}
                    onUpdate={(value) => {
                        if (value === skin) return;
                        reset();
                        setSkin(value);
                    }}
                    width="max"
                >
                    <SegmentedRadioGroup.Option value="standard">
                        Standard
                    </SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="agent">Agent</SegmentedRadioGroup.Option>
                </SegmentedRadioGroup>
                <Select
                    aria-label="Scenario"
                    value={[scenario]}
                    disabled={busy || paused}
                    onUpdate={([value]) => setScenario(value as Scenario)}
                    options={[
                        {value: 'success', content: 'Successful response'},
                        {value: 'tool-error', content: 'Tool error + recovery'},
                        {value: 'generation-error', content: 'Generation error'},
                    ]}
                />
                <SegmentedRadioGroup
                    aria-label="Speed"
                    value={speed}
                    disabled={busy || paused}
                    onUpdate={setSpeed}
                    width="max"
                >
                    {['0.5', '1', '2', '4'].map((value) => (
                        <SegmentedRadioGroup.Option key={value} value={value}>
                            {value}×
                        </SegmentedRadioGroup.Option>
                    ))}
                </SegmentedRadioGroup>
                <Button
                    view="action"
                    disabled={busy || paused}
                    onClick={() => send({content: developerPrompt})}
                >
                    <Icon data={Play} size={16} />
                    Play scenario
                </Button>
                <>
                    <div className="chat-playground__step-controls">
                        <Button
                            size="m"
                            disabled={playbackStep <= 0}
                            onClick={() => seekStep(playbackStep - 1)}
                        >
                            <Icon data={ChevronLeft} size={16} />
                            Prev step
                        </Button>
                        <Button
                            disabled={
                                phase.startsWith('Completed') ||
                                (playbackStep >= 0 && !busy && !paused)
                            }
                            size="m"
                            onClick={() => seekStep(playbackStep + 1)}
                        >
                            Next step
                            <Icon data={ChevronRight} size={16} />
                        </Button>
                    </div>
                    <Text color="secondary">
                        {playbackStep < 0 ? 'Not started' : `Step ${playbackStep + 1}`}
                    </Text>
                    <Button disabled={!busy && !paused} onClick={togglePause}>
                        <Icon data={paused ? Play : Pause} size={16} />
                        {paused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button disabled={!busy} onClick={skipToEnd}>
                        <Icon data={ForwardStep} size={16} />
                        Skip to end
                    </Button>
                </>
                <Button
                    disabled={busy || paused || !lastPrompt.current}
                    onClick={() => {
                        send({content: lastPrompt.current}, true);
                    }}
                >
                    <Icon data={ArrowRotateLeft} size={16} />
                    Replay
                </Button>
                <Button onClick={reset}>
                    <Icon data={ArrowRotateLeft} size={16} />
                    Reset
                </Button>
                <Text color="secondary" aria-live="polite">
                    {paused ? `Paused · ${phase}` : phase}
                </Text>
            </div>
            <div ref={chatRef} className="chat-playground__chat" data-aikit-skin={skin}>
                {skin === 'standard' ? (
                    <ChatContainer
                        messages={messages}
                        status={status}
                        error={error}
                        onSendMessage={send}
                        onCancel={async () => {
                            stop();
                        }}
                        onRetry={() => {
                            send({content: lastPrompt.current}, true);
                        }}
                    />
                ) : chrome.closed ? (
                    <div className="chat-playground__closed">
                        <Text>Code Assistant is closed</Text>
                        <Button onClick={() => chrome.setClosed(false)}>Open Code Assistant</Button>
                    </div>
                ) : (
                    <div className="chat-playground__agent-layout">
                        <AgentChat
                            key={activeChatId}
                            composer={
                                <>
                                    {changes && (
                                        <div className="chat-playground__changes">
                                            <FixtureChangesSummary
                                                key={`${activeChatId}-${changes.runId}`}
                                                files={changes.files}
                                            />
                                        </div>
                                    )}
                                    <AgentComposer
                                        key={activeChatId}
                                        status={status}
                                        onSend={send}
                                        onStop={stop}
                                    />
                                </>
                            }
                            messages={agent.messages}
                            runs={agent.runs}
                            renderAssistantFooter={(message) => {
                                const original = messages.find((item) => item.id === message.id);
                                return original?.role === 'assistant' ? (
                                    <ChangedFilesResponse
                                        key={original.id}
                                        message={original}
                                        onUndo={() =>
                                            setMessages((previous) =>
                                                previous.map((item) =>
                                                    item.id === message.id
                                                        ? {
                                                              ...item,
                                                              metadata: {
                                                                  ...item.metadata,
                                                                  changesUndone: true,
                                                              },
                                                          }
                                                        : item,
                                                ),
                                            )
                                        }
                                        onRestore={() =>
                                            setMessages((previous) =>
                                                previous.map((item) =>
                                                    item.id === message.id
                                                        ? {
                                                              ...item,
                                                              metadata: {
                                                                  ...item.metadata,
                                                                  changesUndone: false,
                                                              },
                                                          }
                                                        : item,
                                                ),
                                            )
                                        }
                                    />
                                ) : null;
                            }}
                            assistantActions={assistantActions}
                            userActions={userActions}
                            showTimestamp
                            status={status}
                            errorMessage={
                                error ? {text: error.message, variant: 'error'} : undefined
                            }
                            onRetry={() => {
                                send({content: lastPrompt.current}, true);
                            }}
                            headerProps={chrome.headerProps}
                            className="chat-playground__agent-container"
                            onClose={() => {
                                stop();
                                chrome.setClosed(true);
                            }}
                            chats={savedChats}
                            activeChat={savedChats.find((chat) => chat.id === activeChatId) || null}
                            onCreateChat={() => {
                                const snapshot = stop();
                                if (messages.length) {
                                    const name = messages.find(
                                        (message) => message.role === 'user',
                                    )?.content;
                                    setSavedChats((previous) => [
                                        ...previous.filter((chat) => chat.id !== activeChatId),
                                        {
                                            id: activeChatId,
                                            name:
                                                typeof name === 'string'
                                                    ? name
                                                    : 'Developer conversation',
                                            createTime: new Date().toISOString(),
                                            messages: snapshot,
                                        },
                                    ]);
                                }
                                replayContext.current = undefined;
                                setPlaybackStep(-1);
                                setActiveChatId(`chat-${++sequenceRef.current}`);
                                setMessages([]);
                                setError(undefined);
                                setPhase('Ready');
                                lastPrompt.current = '';
                            }}
                            onSelectChat={(chat) => {
                                stop();
                                replayContext.current = undefined;
                                setPlaybackStep(-1);
                                const saved = savedChats.find((item) => item.id === chat.id);
                                if (saved) {
                                    setMessages(saved.messages);
                                    setActiveChatId(chat.id);
                                    const prompt = [...saved.messages]
                                        .reverse()
                                        .find((message) => message.role === 'user')?.content;
                                    lastPrompt.current = typeof prompt === 'string' ? prompt : '';
                                }
                                setError(undefined);
                                setPhase('Ready');
                            }}
                            emptyContent={
                                <EmptyContainer
                                    title="Build catalog search and filters"
                                    description="Explore repository context, new components, URL state, tests, approval and a draft PR. This feature flow is simulated locally."
                                    suggestions={[{id: 'start', title: developerPrompt}]}
                                    onSuggestionClick={() => {
                                        send({content: developerPrompt});
                                    }}
                                />
                            }
                        />
                    </div>
                )}
                {skin === 'standard' && scrollControl.visible && (
                    <ScrollToBottomButton
                        className="chat-playground__scroll-to-latest"
                        streaming={busy}
                        onClick={scrollControl.scrollToLatest}
                        style={{bottom: scrollControl.bottom}}
                        qa="demo-scroll-to-latest"
                    />
                )}
            </div>
        </div>
    );
}
