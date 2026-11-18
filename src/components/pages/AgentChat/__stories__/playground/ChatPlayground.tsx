import {useEffect, useRef, useState} from 'react';

import {Button, Dialog, SegmentedRadioGroup, Select, Text} from '@gravity-ui/uikit';

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
import {RunActivityWaitingContext} from '../../../../internal/RunActivityWaitingContext';
import {PlanProgress, PlanStepList} from '../../../../molecules/PlanProgress';
import {AskUserQuestion, type AskUserQuestionAnswer} from '../../../../organisms/AskUserQuestion';
import {EmptyContainer} from '../../../../templates/EmptyContainer';
import {ChatContainer} from '../../../ChatContainer';
import {AgentToolAttention} from '../../AgentToolAttention';

import {useAgentActivity} from './AgentActivity';
import {AgentComposer} from './AgentComposer';
import {ChangedFilesResponse} from './ChangedFilesResponse';
import {ComposerQuestionTransition} from './ComposerQuestionTransition';
import {FixtureChangesSummary} from './FixtureChangesSummary';
import {PlaybackControls} from './PlaybackControls';
import {getDeveloperChanges} from './changedFilesFixture';
import {
    developerCommentary,
    developerPrompt,
    developerReasoning,
    developerResponse,
    developerSteps,
    stepIcon,
} from './developerFlow';
import {
    getLatestPlan,
    getMessagePlan,
    getPlanOperationPart,
    getPlanReview,
    getPlanSteps,
    planPrompt,
    planQuestion,
    planQuestionOptions,
    planReasoning,
    planResponse,
    planTasks,
    planTools,
} from './planFlow';
import {stopRunMessages} from './stopRunMessages';
import {useAgentChrome} from './useAgentChrome';
import {useScrollToLatest} from './useScrollToLatest';

import './ChatPlayground.scss';

type Scenario = 'success' | 'tool-error' | 'generation-error' | 'plan-step-error' | 'plan-question';

export function ChatPlayground({flow = 'developer'}: {flow?: 'developer' | 'plan'}) {
    const isPlan = flow === 'plan';
    const scenarioPrompt = isPlan ? planPrompt : developerPrompt;
    const tools = isPlan ? planTools : developerSteps;
    const [answerPlanQuestion, setAnswerPlanQuestion] =
        useState<(answer: AskUserQuestionAnswer | null) => void>();
    const [planDetails, setPlanDetails] = useState<string>();
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
        planAnswer?: string | null;
        followUps?: TChatMessage[];
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
    const changes = isPlan ? undefined : getDeveloperChanges(messages, status);
    const plan = isPlan ? getLatestPlan(messages, agent.now) : undefined;
    const busy = status === 'submitted' || status === 'streaming';
    const planInProgress = busy && plan?.status === 'running';
    const chatStatus = planInProgress ? 'ready' : status;
    const selectedStep = planTasks.find(({id}) => id === planDetails);
    const showBrief = planDetails === 'brief';
    const planDialogTitle = selectedStep?.title ?? (showBrief ? 'Project brief' : 'Task plan');

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
                              activityPausedDuration:
                                  snapshot.pausedDuration -
                                  Number(message.metadata?.activityPauseBaseline ?? 0),
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
        setAnswerPlanQuestion(undefined);
        const finishedAt = performance.now();
        const snapshot = stopRunMessages(messages, finishedAt, playback.pausedDuration);
        setMessages((previous) => stopRunMessages(previous, finishedAt, playback.pausedDuration));
        setStatus('ready');
        setPhase('Stopped');
        return snapshot;
    };

    const reset = () => {
        stop();
        setPlanDetails(undefined);
        setMessages([]);
        replayContext.current = undefined;
        playbackRef.current = {pausedDuration: 0, skip: false};
        setPlaybackStep(-1);
        setError(undefined);
        lastPrompt.current = '';
        setPhase('Ready');
    };

    const send = async (
        {content}: TSubmitData,
        retry = false,
        seekTarget?: number,
        history = messages,
    ) => {
        if (runRef.current || !content.trim()) {
            return false;
        }
        const controller = new AbortController();
        runRef.current = controller;
        const context: NonNullable<typeof replayContext.current> =
            seekTarget === undefined || !replayContext.current
                ? {messages: [...history], content, retry, scenario}
                : replayContext.current;
        replayContext.current = context;
        const runScenario = context.scenario;
        let checkpoint = -1;
        playbackRef.current = {pausedDuration: 0, skip: false, seekTarget};
        setPlaybackStep(-1);
        setPaused(false);
        lastPrompt.current = content;
        const proposalId = `demo-${++sequenceRef.current}`;
        let id = proposalId;
        let parts: TDefaultMessageContent[] = [];
        const planStepElapsedMs: number[] = [];
        let planStepStartedAt: number | undefined;
        let activityStartedAt = performance.now();
        let activityFinishedAt: number | undefined;
        let responseCompleted = false;
        let awaitingAnswer = false;
        let activityPauseBaseline = 0;
        const getActivityMetadata = () => ({
            ...(isPlan &&
                id !== proposalId && {
                    planProposalId: proposalId,
                    planStepElapsedMs: [...planStepElapsedMs],
                    planStepStartedAt,
                }),
            activityStartedAt,
            activityFinishedAt,
            activityPausedAt: activityFinishedAt ? undefined : playbackRef.current.pausedAt,
            activityPauseBaseline,
            awaitingAnswer,
            activityPausedDuration: playbackRef.current.pausedDuration - activityPauseBaseline,
            activityState: activityFinishedAt ? 'completed' : 'running',
            responseState: responseCompleted ? 'completed' : 'running',
        });
        const update = () => {
            if (controller.signal.aborted) {
                return;
            }
            const activityId = id;
            const contentSnapshot = [...parts];
            const metadata = getActivityMetadata();
            const showActions = !isPlan || (id !== proposalId && responseCompleted);
            setMessages((previous) =>
                previous.map((message) =>
                    message.role === 'assistant' && message.id === activityId
                        ? {
                              ...message,
                              content: contentSnapshot,
                              metadata,
                              actions: showActions ? undefined : [],
                          }
                        : message,
                ),
            );
        };
        const advanceCheckpoint = () => {
            checkpoint += 1;
            setPlaybackStep(checkpoint);
            if (playbackRef.current.seekTarget === checkpoint) {
                const activityId = id;
                const pausedAt = performance.now();
                playbackRef.current.pausedAt = pausedAt;
                setPaused(true);
                setMessages((previous) =>
                    previous.map((message) =>
                        message.id === activityId && message.metadata?.activityState === 'running'
                            ? {
                                  ...message,
                                  metadata: {...message.metadata, activityPausedAt: pausedAt},
                              }
                            : message,
                    ),
                );
            }
        };
        const wait = (ms: number, checkpointEnabled = true) =>
            new Promise<void>((resolve, reject) => {
                // Checkpoints follow visible states, not individual streamed words.
                if (checkpointEnabled) {
                    advanceCheckpoint();
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
                    if (playbackRef.current.pausedAt === undefined) {
                        remaining -= now - previous;
                    }
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
            setPhase(isPlan ? 'Preparing project brief' : 'Thinking');
            parts.push({
                id: `${id}-reasoning`,
                type: 'thinking',
                data: {
                    title: 'Planning the response',
                    status: 'thinking',
                    defaultExpanded: true,
                    content: isPlan ? planReasoning : developerReasoning,
                },
            });
            const proposal: TChatMessage = {
                id,
                role: 'assistant',
                timestamp: new Date().toISOString(),
                content: [...parts],
                actions: isPlan ? [] : undefined,
                metadata: getActivityMetadata(),
            };
            const followUps = context.followUps ?? [];
            setMessages((previous) => [...previous, proposal, ...followUps]);
            if (runScenario === 'plan-question' && context.planAnswer === undefined) {
                playbackRef.current.skip = false;
                playbackRef.current.seekTarget = undefined;
                setPhase('Waiting for your response');
                awaitingAnswer = true;
                update();
                await new Promise<void>((resolve, reject) => {
                    const abort = () => reject(new DOMException('Stopped', 'AbortError'));
                    controller.signal.addEventListener('abort', abort, {once: true});
                    setAnswerPlanQuestion(() => (answer: AskUserQuestionAnswer | null) => {
                        if (controller.signal.aborted || !awaitingAnswer) {
                            return;
                        }
                        if (answer?.type === 'custom') {
                            context.planAnswer = answer.value;
                        } else {
                            context.planAnswer =
                                planQuestionOptions.find((option) => option.id === answer?.optionId)
                                    ?.title ?? null;
                        }
                        awaitingAnswer = false;
                        update();
                        controller.signal.removeEventListener('abort', abort);
                        setAnswerPlanQuestion(undefined);
                        setPhase(isPlan ? 'Preparing project brief' : 'Thinking');
                        resolve();
                    });
                });
            }
            await wait(isPlan ? 2400 : 1800);
            parts[0] = {
                id: `${id}-reasoning`,
                type: 'thinking',
                data: {
                    title: 'Plan ready',
                    status: 'thought',
                    defaultExpanded: true,
                    content: context.planAnswer
                        ? `${planReasoning} Registration preference: ${context.planAnswer}.`
                        : isPlan
                          ? planReasoning
                          : developerReasoning,
                },
            };
            let failed = false;
            for (const [stepIndex, step] of tools.entries()) {
                const partIndex = parts.length;
                const data = {
                    toolName: step.name,
                    demoContext: {target: step.target, ...step.compactContext},
                    toolIcon: stepIcon(step.icon),
                    headerContent: step.target,
                    bodyContent:
                        isPlan && stepIndex === 0 ? (
                            <>
                                {context.planAnswer && (
                                    <Text>Registration preference: {context.planAnswer}</Text>
                                )}
                                <PlanStepList steps={getPlanSteps()} onStepClick={setPlanDetails} />
                            </>
                        ) : (
                            step.body
                        ),
                    footerContent: step.tool,
                    initialExpanded: true,
                    autoCollapseOnSuccess: true,
                };
                parts.push({
                    id: `${id}-tool-${stepIndex}`,
                    type: 'tool',
                    data: {...data, status: 'loading'},
                });
                setPhase(isPlan ? 'Preparing plan' : `Tool ${stepIndex + 1} / ${tools.length}`);
                update();
                await wait(2600);
                if ('confirmation' in step) {
                    setPhase('Waiting for confirmation');
                    if (isPlan) {
                        activityFinishedAt = performance.now();
                        parts.push({
                            id: 'demo-answer',
                            type: 'text',
                            data: {
                                text: 'I prepared a five-step plan for the event registration page. Ready to start?',
                            },
                        });
                        advanceCheckpoint();
                    }
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
                        const toolParts = parts;
                        const toolId = `${id}-tool-${stepIndex}`;
                        await new Promise<void>((resolve, reject) => {
                            const abort = () => {
                                playbackRef.current.continueConfirmation = undefined;
                                reject(new DOMException('Stopped', 'AbortError'));
                            };
                            const accept = () => {
                                setPlanDetails(undefined);
                                playbackRef.current.continueConfirmation = undefined;
                                controller.signal.removeEventListener('abort', abort);
                                resolve();
                            };
                            playbackRef.current.continueConfirmation = accept;
                            controller.signal.addEventListener('abort', abort, {once: true});
                            toolParts[partIndex] = {
                                id: toolId,
                                type: 'tool',
                                data: {
                                    ...data,
                                    status: 'waitingConfirmation',
                                    ...(isPlan
                                        ? {
                                              footerActions: [
                                                  {
                                                      label: 'Project brief',
                                                      view: 'outlined' as const,
                                                      onClick: () => setPlanDetails('brief'),
                                                  },
                                                  {
                                                      label: 'Approve and start',
                                                      view: 'action' as const,
                                                      onClick: accept,
                                                  },
                                              ],
                                          }
                                        : {onAccept: accept, onReject: stop}),
                                },
                            };
                            update();
                        });
                    }
                    if (controller.signal.aborted) {
                        return undefined;
                    }
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
                if (isPlan && 'confirmation' in step) {
                    parts = parts.map((part) =>
                        part.type === 'text' && part.id === 'demo-answer'
                            ? {...part, data: {text: 'I’ll start implementing the plan.'}}
                            : part,
                    );
                    responseCompleted = true;
                    update();

                    // Approval ends the proposal. Execution has its own message and activity clock.
                    id = `${proposalId}-execution`;
                    parts = [];
                    responseCompleted = false;
                    activityStartedAt = performance.now();
                    activityFinishedAt = undefined;
                    activityPauseBaseline = playbackRef.current.pausedDuration;
                    if (playbackRef.current.pausedAt !== undefined) {
                        playbackRef.current.pausedAt = activityStartedAt;
                    }
                    const execution: TChatMessage = {
                        id,
                        role: 'assistant',
                        timestamp: new Date().toISOString(),
                        content: [],
                        actions: [],
                        metadata: getActivityMetadata(),
                    };
                    setMessages((previous) =>
                        previous.flatMap((message) =>
                            message.id === proposalId ? [message, execution] : [message],
                        ),
                    );
                    continue;
                }
                setPhase(
                    `Tool ${stepIndex + 1} / ${tools.length} · ${
                        runScenario === 'tool-error' && step.tool === 'repo_code_search'
                            ? 'Error'
                            : 'Completed'
                    }`,
                );
                update();
                await wait(700);
                if (!isPlan && developerCommentary[stepIndex]) {
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
            if (isPlan) {
                const executionTime = () =>
                    performance.now() - playbackRef.current.pausedDuration + activityPauseBaseline;
                for (const [taskIndex, task] of planTasks.entries()) {
                    const stepLabel = `Step ${taskIndex + 1} / ${planTasks.length}`;
                    const stepStartedAt = executionTime();
                    planStepStartedAt = stepStartedAt;
                    parts.push({
                        id: `${id}-${task.id}`,
                        type: 'text',
                        data: {text: `**${task.title}**`},
                    });
                    for (const [operationIndex, operation] of task.operations.entries()) {
                        const partIndex = parts.length;
                        const lastOperation = operationIndex === task.operations.length - 1;
                        setPhase(`${stepLabel} · ${operation.action}`);
                        parts.push(getPlanOperationPart(id, operation, 'loading'));
                        update();
                        await wait(task.durationMs / task.operations.length);

                        const operationError =
                            runScenario === 'plan-step-error' && 'error' in operation
                                ? operation.error
                                : undefined;
                        if (lastOperation || operationError) {
                            planStepElapsedMs[taskIndex] = Math.max(
                                0,
                                executionTime() - stepStartedAt,
                            );
                            planStepStartedAt = undefined;
                        }
                        parts[partIndex] = getPlanOperationPart(
                            id,
                            operation,
                            operationError ? 'error' : 'success',
                            operationError,
                        );
                        if (operationError) {
                            throw new Error(operationError);
                        }
                        setPhase(`${stepLabel} · ${lastOperation ? 'Completed' : 'In progress'}`);
                        update();
                        await wait(650);
                    }
                }
            }
            activityFinishedAt = performance.now();
            update();
            setPhase(isPlan ? 'Preparing the result' : 'Streaming');
            await wait(0);
            const response = isPlan ? planResponse : developerResponse(failed);
            const chunks = response.match(/\S+\s*/g) || [];
            const streamingCheckpoint = Math.min(30, Math.floor(chunks.length / 2));
            const textIndex = parts.length;
            for (let index = 0; index < chunks.length; index++) {
                if (index === streamingCheckpoint) {
                    await wait(0);
                }
                await wait(25, false);
                if (runScenario === 'generation-error' && index === streamingCheckpoint) {
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
                const contentSnapshot = [...parts];
                const metadata = getActivityMetadata();
                const finishedAt = performance.now();
                setMessages((previous) =>
                    previous.map((message) =>
                        message.role === 'assistant' && message.id === id
                            ? {
                                  ...message,
                                  content: contentSnapshot,
                                  metadata: {
                                      ...metadata,
                                      activityState: 'error',
                                      responseState: 'error',
                                      activityFinishedAt: finishedAt,
                                  },
                              }
                            : message,
                    ),
                );
                setStatus('error');
                setPhase(
                    runScenario === 'plan-step-error' ? 'Plan step failed' : 'Generation error',
                );
            }
        } finally {
            if (runRef.current === controller) {
                runRef.current = null;
                playbackRef.current.continueConfirmation = undefined;
                setPaused(false);
            }
        }
        return undefined;
    };

    const sendChatMessage = async (data: TSubmitData) => {
        if (!planInProgress || !plan) {
            return send(data);
        }
        const context = replayContext.current;
        if (!context || !data.content.trim()) {
            return false;
        }

        const id = `demo-${++sequenceRef.current}`;
        const timestamp = new Date().toISOString();
        const completed = plan.steps.filter((step) => step.status === 'completed').length;
        const response = `${completed} of ${plan.steps.length} plan steps are complete.`;
        const followUp: TChatMessage[] = [
            {
                id: `${id}-user`,
                role: 'user',
                content: data.content,
                timestamp,
                metadata: {planFollowUp: true},
            },
            {
                id,
                role: 'assistant',
                content: response,
                timestamp,
                actions: [],
            },
        ];
        context.followUps = [...(context.followUps ?? []), ...followUp];
        setMessages((previous) => [...previous, ...followUp]);
        return undefined;
    };

    const seekStep = (target: number) => {
        const context = replayContext.current;
        if (target < 0) {
            return;
        }
        if (!context) {
            send({content: scenarioPrompt}, false, 0);
            return;
        }
        runRef.current?.abort();
        runRef.current = null;
        send({content: context.content}, context.retry, target);
    };

    const replay = () => {
        const content = lastPrompt.current;
        if (runRef.current || !content) {
            return;
        }
        setPlanDetails(undefined);
        setMessages([]);
        send({content}, false, undefined, []);
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
                if (runRef.current) {
                    return;
                }
                const startId = message.metadata?.planProposalId ?? message.id;
                const index = messages.findIndex((item) => item.id === startId);
                if (index < 0) {
                    return;
                }
                const prompt = messages
                    .slice(0, index)
                    .reverse()
                    .find((item) => item.role === 'user');
                if (prompt?.role !== 'user') {
                    return;
                }
                const history = messages.slice(0, index);
                setMessages(history);
                send({content: prompt.content}, true, undefined, history);
            },
        },
        {type: BaseMessageActionType.Like, onClick: (message) => rateAnswer(message.id, 'like')},
        {
            type: BaseMessageActionType.Dislike,
            onClick: (message) => rateAnswer(message.id, 'dislike'),
        },
    ];

    return (
        <div className="chat-playground">
            <div className="chat-playground__toolbar">
                <Text variant="subheader-2">Chat Playground</Text>
                {!isPlan && (
                    <SegmentedRadioGroup
                        aria-label="Skin"
                        value={skin}
                        onUpdate={(value) => {
                            if (value === skin) {
                                return;
                            }
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
                )}
                {isPlan ? (
                    <SegmentedRadioGroup
                        aria-label="Scenario"
                        className="chat-playground__plan-scenarios"
                        value={scenario}
                        disabled={busy || paused}
                        onUpdate={(value) => setScenario(value as Scenario)}
                        width="max"
                    >
                        <SegmentedRadioGroup.Option value="success">
                            Plan
                        </SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value="plan-question">
                            Question
                        </SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value="plan-step-error">
                            Error
                        </SegmentedRadioGroup.Option>
                    </SegmentedRadioGroup>
                ) : (
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
                )}
                <PlaybackControls
                    speed={speed}
                    onSpeedChange={setSpeed}
                    busy={busy}
                    paused={paused}
                    step={playbackStep}
                    phase={phase}
                    previousDisabled={Boolean(answerPlanQuestion) || playbackStep <= 0}
                    nextDisabled={
                        Boolean(answerPlanQuestion) ||
                        phase.startsWith('Completed') ||
                        (playbackStep >= 0 && !busy && !paused)
                    }
                    skipDisabled={!busy || Boolean(answerPlanQuestion)}
                    replayDisabled={busy || paused || !lastPrompt.current}
                    onPlay={() => send({content: scenarioPrompt})}
                    onPrevious={() => seekStep(playbackStep - 1)}
                    onNext={() => seekStep(playbackStep + 1)}
                    onPause={togglePause}
                    onSkip={skipToEnd}
                    onReplay={replay}
                    onReset={reset}
                />
            </div>
            {isPlan && (
                <Dialog
                    open={Boolean(planDetails)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setPlanDetails(undefined);
                        }
                    }}
                    aria-label={planDialogTitle}
                >
                    <Dialog.Header caption={planDialogTitle} />
                    <Dialog.Body>
                        {showBrief && <Text>{planPrompt}</Text>}
                        {selectedStep?.description}
                        {!selectedStep && !showBrief && (
                            <PlanStepList
                                steps={plan?.steps ?? getPlanSteps()}
                                onStepClick={setPlanDetails}
                            />
                        )}
                    </Dialog.Body>
                    <Dialog.Footer
                        onClickButtonCancel={() => setPlanDetails(selectedStep ? 'all' : undefined)}
                        textButtonCancel={selectedStep ? 'Back to plan' : 'Close'}
                    />
                </Dialog>
            )}
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
                                    {planInProgress && plan && (
                                        <div className="chat-playground__changes">
                                            <PlanProgress
                                                key={plan.id}
                                                steps={plan.steps}
                                                onStepClick={setPlanDetails}
                                                status={plan.status}
                                            />
                                            {plan.files.length > 0 && (
                                                <FixtureChangesSummary
                                                    key={`changes-${plan.id}`}
                                                    files={plan.files}
                                                />
                                            )}
                                        </div>
                                    )}
                                    {changes && (
                                        <div className="chat-playground__changes">
                                            <FixtureChangesSummary
                                                key={`${activeChatId}-${changes.runId}`}
                                                files={changes.files}
                                            />
                                        </div>
                                    )}
                                    <ComposerQuestionTransition
                                        key={activeChatId}
                                        question={
                                            answerPlanQuestion && (
                                                <AskUserQuestion
                                                    question={planQuestion}
                                                    options={planQuestionOptions}
                                                    onAnswer={answerPlanQuestion}
                                                    onClose={() => answerPlanQuestion(null)}
                                                />
                                            )
                                        }
                                        composer={
                                            <AgentComposer
                                                compactControls={isPlan}
                                                status={chatStatus}
                                                onSend={sendChatMessage}
                                                onStop={stop}
                                            />
                                        }
                                    />
                                </>
                            }
                            messages={agent.messages}
                            runs={agent.runs}
                            renderAssistantFooter={(message) => {
                                const original = messages.find((item) => item.id === message.id);
                                if (original?.role !== 'assistant') {
                                    return null;
                                }
                                const review = isPlan ? getPlanReview(original) : undefined;
                                if (review?.data.status === 'waitingConfirmation') {
                                    return (
                                        <RunActivityWaitingContext.Provider value={true}>
                                            <AgentToolAttention {...review.data} />
                                        </RunActivityWaitingContext.Provider>
                                    );
                                }
                                const result = isPlan ? getMessagePlan(original) : undefined;
                                const setChangesUndone = (changesUndone: boolean) => {
                                    setMessages((previous) =>
                                        previous.map((item) =>
                                            item.id === message.id
                                                ? {
                                                      ...item,
                                                      metadata: {...item.metadata, changesUndone},
                                                  }
                                                : item,
                                        ),
                                    );
                                };
                                return (
                                    <>
                                        {(result?.status === 'failed' ||
                                            result?.status === 'cancelled') && (
                                            <PlanProgress
                                                steps={result.steps}
                                                status={result.status}
                                                view="card"
                                                onStepClick={setPlanDetails}
                                            />
                                        )}
                                        <ChangedFilesResponse
                                            key={original.id}
                                            message={original}
                                            files={isPlan ? (result?.files ?? []) : undefined}
                                            onUndo={() => setChangesUndone(true)}
                                            onRestore={() => setChangesUndone(false)}
                                        />
                                    </>
                                );
                            }}
                            assistantActions={assistantActions}
                            userActions={userActions}
                            showTimestamp
                            status={chatStatus}
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
                                setPlanDetails(undefined);
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
                                setPlanDetails(undefined);
                                replayContext.current = undefined;
                                setPlaybackStep(-1);
                                const saved = savedChats.find((item) => item.id === chat.id);
                                if (saved) {
                                    setMessages(saved.messages);
                                    setActiveChatId(chat.id);
                                    const prompt = [...saved.messages]
                                        .reverse()
                                        .find(
                                            (message) =>
                                                message.role === 'user' &&
                                                !message.metadata?.planFollowUp,
                                        )?.content;
                                    lastPrompt.current = typeof prompt === 'string' ? prompt : '';
                                }
                                setError(undefined);
                                setPhase('Ready');
                            }}
                            emptyContent={
                                <EmptyContainer
                                    title={
                                        isPlan
                                            ? 'Plan an event registration page'
                                            : 'Build catalog search and filters'
                                    }
                                    description={
                                        isPlan
                                            ? 'Review the plan, approve it, and follow the steps as they run.'
                                            : 'Explore repository context, new components, URL state, tests, approval and a draft PR. This feature flow is simulated locally.'
                                    }
                                    suggestions={[{id: 'start', title: scenarioPrompt}]}
                                    onSuggestionClick={() => {
                                        send({content: scenarioPrompt});
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
