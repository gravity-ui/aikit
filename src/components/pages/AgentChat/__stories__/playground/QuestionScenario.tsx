import {useEffect, useRef, useState} from 'react';

import {BookOpen, CircleCheck, Sparkles, Terminal} from '@gravity-ui/icons';
import {Button, Icon, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {AgentChat, type AgentChatRun, type AgentRunContent} from '../..';
import {
    BaseMessageActionType,
    type ChatStatus,
    type DefaultMessageAction,
    type TAssistantMessage,
    type TUserMessage,
    type UserRating,
} from '../../../../../types';
import {copyToClipboard} from '../../../../../utils/clipboardUtils';
import {AskUserQuestion} from '../../../../organisms/AskUserQuestion';
import type {AskUserQuestionAnswer} from '../../../../organisms/AskUserQuestion';
import type {RunActivityStep} from '../../../../organisms/RunActivity';

import {AgentComposer} from './AgentComposer';
import {ComposerQuestionTransition} from './ComposerQuestionTransition';
import {PlaybackControls} from './PlaybackControls';

import './ChatPlayground.scss';
import './QuestionScenario.scss';

type ScenarioAnswer = AskUserQuestionAnswer | {type: 'skipped'};

type Phase =
    | 'idle'
    | 'loading'
    | 'thinking'
    | 'reading'
    | 'question'
    | 'working'
    | 'checking'
    | 'streaming'
    | 'complete'
    | 'stopped';

const options = [
    {
        id: 'shared',
        title: 'Shared',
        recommended: true,
        description: 'Use one accent color across all workspaces.',
    },
    {
        id: 'independent',
        title: 'Independent',
        description: 'Let each workspace choose its own accent color.',
    },
];

const questions = [
    {
        title: 'Should all workspaces share the same accent color or use separate settings?',
        options,
        allowCustomAnswer: true,
    },
    {
        title: 'Which themes should the accent color support?',
        allowCustomAnswer: true,
        options: [
            {
                id: 'both',
                title: 'Light and dark',
                recommended: true,
                description: 'Use accessible color variants in both themes.',
            },
            {
                id: 'system',
                title: 'System theme only',
                description: 'Follow the current device appearance.',
            },
        ],
    },
    {
        title: 'Which palette should Reset restore?',
        allowCustomAnswer: true,
        options: [
            {
                id: 'default',
                title: 'Product default',
                recommended: true,
                description: 'Restore the standard product palette.',
            },
            {
                id: 'organization',
                title: 'Organization palette',
                description: 'Restore the palette chosen by the organization.',
            },
        ],
    },
];

const composerOptions = [
    {
        id: 'custom',
        title: 'Shared with overrides',
        description: 'Inherit the organization color and allow workspace overrides.',
    },
    {
        id: 'light',
        title: 'Light theme only',
        description: 'Apply the accent color only in the light theme.',
    },
    {
        id: 'previous',
        title: 'Previously saved palette',
        description: 'Restore the last palette saved for this workspace.',
    },
];

function answerText(response: ScenarioAnswer, index: number) {
    if (response.type === 'skipped') {
        return 'Skipped — no answer provided.';
    }
    if (response.type === 'custom') {
        return response.value;
    }
    if (response.optionId === composerOptions[index].id) {
        return composerOptions[index].title;
    }
    if (index === 0) {
        return response.optionId === 'shared'
            ? 'Use a shared accent color.'
            : 'Use independent accent colors.';
    }
    return questions[index].options.find((option) => option.id === response.optionId)?.title ?? '';
}

function getFinalAnswer(answer: string) {
    let proposal =
        'Use your custom response as the requirement for the workspace appearance settings.';
    if (answer === 'Shared with overrides') {
        proposal =
            'Workspaces inherit the organization accent color by default and can save their own override.';
    } else if (answer === 'Use independent accent colors.') {
        proposal =
            'Each workspace gets an accent color selector. Changing one workspace leaves the others unchanged.';
    } else if (
        answer === 'Use a shared accent color.' ||
        answer === 'Use the recommended shared accent color.'
    ) {
        proposal =
            'Use a single accent color in the organization settings. All workspaces inherit it, keeping the interface consistent.';
    }
    return `## Workspace appearance settings are ready

${proposal}

### What changed

- Added an **Accent color** section to the appearance settings with a color preview and a reset action.
- Applied the recorded color scope to workspace appearance settings.
- Connected the selected color to buttons, links, and keyboard focus indicators according to the recorded theme requirements.
- Kept the previous value until the user saves. Cancel discards the draft; Reset follows the recorded palette requirements.

### Interaction details

The preview updates while a color is being selected. Saving applies the setting and shows a confirmation. If saving fails, the draft stays in place so the user can retry.

${answer.startsWith('Use ') ? '**Your choice:** ' + answer : '**Custom requirement:** ' + answer}

### Validation

The demo flow covers saving a color, cancelling a draft, resetting the palette, and switching between workspaces. The selected scope is preserved when the settings panel is reopened.

The change is ready for review. You can try a different answer by restarting the scenario.`;
}

const automaticPhases: Partial<Record<Phase, {next: Phase; duration: number}>> = {
    loading: {next: 'thinking', duration: 700},
    thinking: {next: 'reading', duration: 1300},
    reading: {next: 'question', duration: 1200},
    working: {next: 'checking', duration: 1600},
    checking: {next: 'streaming', duration: 1200},
};
const phaseActions: Partial<Record<Phase, {label: string; icon: typeof Sparkles}>> = {
    thinking: {label: 'Planning workspace appearance settings', icon: Sparkles},
    reading: {label: 'Read appearance settings', icon: BookOpen},
    working: {label: 'Update workspace appearance', icon: Terminal},
    checking: {label: 'Check color scope and theme variants', icon: CircleCheck},
};
function getActivitySteps(
    phase: Phase,
    answer: string,
    responses: Record<number, ScenarioAnswer>,
    questionCount: number,
): RunActivityStep[] {
    const steps: RunActivityStep[] = [
        {
            id: 'plan',
            kind: 'thinking',
            props: {
                title: 'Planning workspace appearance settings',
                status: phase === 'thinking' ? 'thinking' : 'thought',
                content:
                    'I will inspect the current palette and settings scope, clarify the intended behavior, then update the appearance controls and verify the result.',
            },
        },
    ];
    if (phase === 'thinking') {
        return steps;
    }
    steps.push({
        id: 'read',
        kind: 'tool',
        props: {
            toolName: 'Read',
            toolIcon: <Icon data={BookOpen} size={14} />,
            secondaryText: 'appearance.ts',
            contextTooltip: 'src/settings/appearance.ts',
            status: phase === 'reading' ? 'loading' : 'success',
            bodyContent: 'Found the current palette defaults and workspace appearance preferences.',
        },
    });
    questions.slice(0, questionCount).forEach((question, index) => {
        const response = responses[index];
        if (!response) {
            return;
        }
        steps.push({
            id: `decision-${index}`,
            kind: 'commentary',
            content: (
                <>
                    <strong>
                        {questionCount > 1
                            ? `Your response ${index + 1} of ${questionCount}`
                            : 'Your response'}
                    </strong>
                    <div>{question.title}</div>
                    <div>{answerText(response, index)}</div>
                </>
            ),
        });
    });
    if (!answer) {
        return steps;
    }
    const hasSkipped = Object.values(responses).some((response) => response.type === 'skipped');
    steps.push({
        id: 'update',
        kind: 'tool',
        props: {
            toolName: hasSkipped ? 'Review' : 'Edit',
            toolIcon: <Icon data={Terminal} size={14} />,
            secondaryText: 'WorkspaceAppearance.tsx',
            contextTooltip: 'src/settings/WorkspaceAppearance.tsx',
            status: phase === 'working' ? 'loading' : 'success',
            bodyContent: hasSkipped
                ? 'Reviewed the recorded requirements. Skipped settings keep their existing behavior.'
                : 'Connected the chosen color scope, theme variants, and reset behavior.',
        },
    });
    if (phase === 'working') {
        return steps;
    }
    steps.push({
        id: 'check',
        kind: 'tool',
        props: {
            toolName: 'Check appearance settings',
            toolIcon: <Icon data={CircleCheck} size={14} />,
            secondaryText: 'workspaceAppearance.test.ts',
            status: phase === 'checking' ? 'loading' : 'success',
            bodyContent: hasSkipped
                ? 'Verified that skipped questions did not supply defaults or invent requirements.'
                : 'Demo checks cover color scope, theme variants, saving, cancellation, and reset.',
        },
    });
    return steps;
}

function getActivityLabel(phase: Phase, paused: boolean, action: string) {
    if (phase === 'question') {
        return 'Waiting for your response';
    }
    if (paused) {
        return `Paused · ${action}`;
    }
    return undefined;
}

function getPlaybackState(
    phase: Phase,
    paused: boolean,
    prompt: string,
    questionIndex: number,
    questionCount: number,
    allAnswered: boolean,
) {
    const busy = ['loading', 'thinking', 'reading', 'working', 'checking', 'streaming'].includes(
        phase,
    );
    return {
        busy: busy || phase === 'question',
        nextDisabled:
            phase === 'complete' ||
            (phase === 'question' && questionIndex === questionCount - 1 && !allAnswered),
        replayDisabled: busy || paused || phase === 'question' || !prompt,
        phaseLabel: phase === 'question' ? 'Waiting for your response' : phase,
    };
}

/** Local host simulation: no model or backend requests are made. */
export function QuestionScenario() {
    const [userRating, setUserRating] = useState<UserRating>();
    const [timestamp, setTimestamp] = useState(() => new Date().toISOString());
    const [speed, setSpeed] = useState('1');
    const [paused, setPaused] = useState(false);
    const streamCursor = useRef(0);
    const phaseClock = useRef({phase: '', remaining: 1400});
    const [placement, setPlacement] = useState('inline');
    const [questionMode, setQuestionMode] = useState('1');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [responses, setResponses] = useState<Record<number, ScenarioAnswer>>({});
    const [drafts, setDrafts] = useState<Record<number, string>>({});
    const questionCount = Number(questionMode);
    const currentQuestion = questions[questionIndex];
    const currentResponse = responses[questionIndex];
    const [prompt, setPrompt] = useState('');
    const [phase, setPhase] = useState<Phase>('idle');
    const [answer, setAnswer] = useState('');
    const [visibleCharacters, setVisibleCharacters] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [version, setVersion] = useState(0);
    useEffect(() => {
        const automatic = automaticPhases[phase];
        if (!automatic || paused) {
            return undefined;
        }
        if (phaseClock.current.phase !== phase) {
            phaseClock.current = {phase, remaining: automatic.duration};
        }
        const started = performance.now();
        const rate = Number(speed);
        const timer = setTimeout(
            () => setPhase(automatic.next),
            phaseClock.current.remaining / rate,
        );
        return () => {
            clearTimeout(timer);
            phaseClock.current.remaining = Math.max(
                0,
                phaseClock.current.remaining - (performance.now() - started) * rate,
            );
        };
    }, [phase, paused, speed]);

    const continueWith = (saved: Record<number, ScenarioAnswer>) => {
        setAnswer(answerText(saved[0], 0));
        setPaused(false);
        setPhase('working');
    };
    const respond = (response: AskUserQuestionAnswer) => {
        const nextResponses = {...responses, [questionIndex]: response};
        setResponses(nextResponses);
        const unanswered = questions
            .slice(0, questionCount)
            .findIndex((_, index) => !nextResponses[index]);
        if (unanswered !== -1) {
            setQuestionIndex(unanswered);
            return;
        }
        if (questionCount === 1) {
            continueWith(nextResponses);
        }
    };
    const allAnswered = questions.slice(0, questionCount).every((_, index) => responses[index]);
    const busy = ['loading', 'thinking', 'reading', 'working', 'checking', 'streaming'].includes(
        phase,
    );
    const statuses: Partial<Record<Phase, ChatStatus>> = {
        loading: 'submitted',
        question: 'streaming',
        thinking: 'streaming',
        reading: 'streaming',
        working: 'streaming',
        checking: 'streaming',
        streaming: 'streaming',
    };
    const status = statuses[phase] ?? 'ready';
    useEffect(() => {
        if (!busy || paused) {
            return undefined;
        }
        const timer = setInterval(() => setElapsed((value) => value + 100 * Number(speed)), 100);
        return () => clearInterval(timer);
    }, [busy, paused, speed]);
    const activityStates: Record<Phase, AgentChatRun['activity']['state']> = {
        idle: 'running',
        loading: 'running',
        reading: 'running',
        checking: 'running',
        thinking: 'running',
        question: 'needs-input',
        working: 'running',
        streaming: 'completed',
        complete: 'completed',
        stopped: 'cancelled',
    };
    const activityState = activityStates[phase];
    const action = phaseActions[phase] ?? {
        label: 'Planning workspace appearance settings',
        icon: Sparkles,
    };
    const question =
        phase === 'question' ? (
            <div>
                <AskUserQuestion
                    className="question-scenario__question"
                    question={currentQuestion.title}
                    options={
                        placement === 'composer'
                            ? [...currentQuestion.options, composerOptions[questionIndex]]
                            : currentQuestion.options
                    }
                    questionIndex={questionIndex}
                    questionCount={questionCount}
                    answeredQuestionIndices={Object.keys(responses)
                        .map(Number)
                        .filter((index) => responses[index].type !== 'skipped')}
                    onQuestionChange={setQuestionIndex}
                    allowCustomAnswer={currentQuestion.allowCustomAnswer}
                    customAnswer={drafts[questionIndex] ?? ''}
                    onCustomAnswerChange={(value) => {
                        setDrafts((previous) => ({...previous, [questionIndex]: value}));
                        setResponses((previous) => {
                            const next = {...previous};
                            delete next[questionIndex];
                            return next;
                        });
                    }}
                    selectedAnswer={
                        currentResponse?.type === 'skipped' ? undefined : currentResponse
                    }
                    onProgressComplete={() => {
                        if (allAnswered) {
                            continueWith(responses);
                        }
                    }}
                    onAnswer={respond}
                    onClose={() => {
                        const next = {...responses};
                        questions.slice(0, questionCount).forEach((_, index) => {
                            next[index] ??= {type: 'skipped'};
                        });
                        setResponses(next);
                        continueWith(next);
                    }}
                />
                {responses[questionIndex] && (
                    <Text color="secondary">
                        Your answer: {answerText(responses[questionIndex], questionIndex)}
                    </Text>
                )}
            </div>
        ) : undefined;
    const runs: AgentChatRun[] = ['idle', 'loading'].includes(phase)
        ? []
        : [
              {
                  messageId: 'question-response',
                  activity: {
                      id: `question-run-${version}`,
                      state: paused ? 'paused' : activityState,
                      label: getActivityLabel(phase, paused, action.label),
                      durationMs: elapsed,
                      currentAction: {
                          label: action.label,
                          icon: <Icon data={action.icon} size={14} />,
                      },
                      steps: getActivitySteps(phase, answer, responses, questionCount),
                      attention:
                          placement === 'inline' ? (
                              <div className="question-scenario__attention">{question}</div>
                          ) : undefined,
                  },
              },
          ];
    const decisions = questions
        .slice(1, questionCount)
        .map(
            (item, index) =>
                `- **${item.title}** ${responses[index + 1] ? answerText(responses[index + 1], index + 1) : ''}`,
        )
        .join('\n');
    const hasSkipped = Object.values(responses).some((response) => response.type === 'skipped');
    const finalAnswer = hasSkipped
        ? `## Workspace appearance settings review

I continued without filling in the skipped answers. No recommended options were selected automatically.

### Recorded requirements

${questions
    .slice(0, questionCount)
    .map(
        (item, index) =>
            `- **${item.title}** ${responses[index] ? answerText(responses[index], index) : 'Not answered.'}`,
    )
    .join('\n')}

### Next steps

Keep the existing behavior for the unresolved settings. The recorded answers can guide a focused implementation once the remaining requirements are clarified.`
        : getFinalAnswer(answer) +
          (decisions ? `\n\n### Additional decisions\n\n${decisions}` : '');
    useEffect(() => {
        if (phase !== 'streaming' || paused) {
            return undefined;
        }
        let cursor = streamCursor.current;
        const timer = setInterval(
            () => {
                cursor = Math.min(cursor + 24, finalAnswer.length);
                streamCursor.current = cursor;
                setVisibleCharacters(cursor);
                if (cursor === finalAnswer.length) {
                    clearInterval(timer);
                    setPhase('complete');
                }
            },
            45 / Number(speed),
        );
        return () => clearInterval(timer);
    }, [phase, finalAnswer, paused, speed]);
    let responseContent = '';
    if (['streaming', 'complete', 'stopped'].includes(phase)) {
        responseContent = finalAnswer.slice(0, visibleCharacters);
    }
    if (phase === 'stopped') {
        responseContent += '\n\nGeneration stopped. Send a new prompt to try again.';
    }
    const sendPrompt = (content: string) => {
        setUserRating(undefined);
        setTimestamp(new Date().toISOString());
        setPaused(false);
        streamCursor.current = 0;
        phaseClock.current = {phase: '', remaining: 1400};
        setElapsed(0);
        setVisibleCharacters(0);
        setDrafts({});
        setResponses({});
        setQuestionIndex(0);
        setPrompt(content);
        setAnswer('');
        setVersion((value) => value + 1);
        setPhase('loading');
    };
    const reset = () => {
        setUserRating(undefined);
        setPaused(false);
        streamCursor.current = 0;
        phaseClock.current = {phase: '', remaining: 1400};
        setElapsed(0);
        setVisibleCharacters(0);
        setDrafts({});
        setResponses({});
        setQuestionIndex(0);
        setPhase('idle');
        setPrompt('');
        setAnswer('');
        setVersion((value) => value + 1);
    };

    const phaseSteps: Record<Phase, number> = {
        idle: -1,
        loading: 0,
        thinking: 1,
        reading: 2,
        question: questionIndex + 3,
        working: questionCount + 3,
        checking: questionCount + 4,
        streaming: questionCount + 5,
        complete: questionCount + 6,
        stopped: questionCount + 5,
    };
    const step = phaseSteps[phase];
    const playbackState = getPlaybackState(
        phase,
        paused,
        prompt,
        questionIndex,
        questionCount,
        allAnswered,
    );
    const seekStep = (target: number) => {
        setPaused(true);
        if (!prompt) {
            setPrompt('Add accent color settings for workspaces.');
        }
        if (target < 3) {
            setPhase((['loading', 'thinking', 'reading'] as Phase[])[Math.max(0, target)]);
            return;
        }
        if (target < questionCount + 3) {
            setQuestionIndex(target - 3);
            setPhase('question');
            setPaused(false);
            return;
        }
        if (!allAnswered) {
            setQuestionIndex(
                questions.slice(0, questionCount).findIndex((_, index) => !responses[index]),
            );
            setPhase('question');
            setPaused(false);
            return;
        }
        setAnswer(answerText(responses[0], 0));
        if (target === questionCount + 3) {
            setPhase('working');
            return;
        }
        if (target === questionCount + 4) {
            setPhase('checking');
            return;
        }
        if (target === questionCount + 5) {
            streamCursor.current = 0;
            setVisibleCharacters(0);
            setPhase('streaming');
            return;
        }
        streamCursor.current = finalAnswer.length;
        setVisibleCharacters(finalAnswer.length);
        setPaused(false);
        setPhase('complete');
    };
    const skipToEnd = () => {
        setPaused(false);
        if (['loading', 'thinking', 'reading'].includes(phase)) {
            setPhase('question');
            return;
        }
        streamCursor.current = finalAnswer.length;
        setVisibleCharacters(finalAnswer.length);
        setPhase('complete');
    };

    const userActions: DefaultMessageAction<TUserMessage>[] = [
        {type: BaseMessageActionType.Copy, onClick: (message) => copyToClipboard(message.content)},
    ];
    const assistantActions: DefaultMessageAction<TAssistantMessage<AgentRunContent>>[] = [
        {type: BaseMessageActionType.Copy, onClick: () => copyToClipboard(responseContent)},
        {
            type: BaseMessageActionType.Retry,
            onClick: () => {
                if (busy) {
                    return;
                }
                setUserRating(undefined);
                setPaused(false);
                streamCursor.current = 0;
                setVisibleCharacters(0);
                setVersion((value) => value + 1);
                setPhase('working');
            },
        },
        {
            type: BaseMessageActionType.Like,
            onClick: () => setUserRating((value) => (value === 'like' ? undefined : 'like')),
        },
        {
            type: BaseMessageActionType.Dislike,
            onClick: () => setUserRating((value) => (value === 'dislike' ? undefined : 'dislike')),
        },
    ];

    return (
        <div className="chat-playground-decorator">
            <div className="chat-playground-decorator__container">
                <div className="chat-playground question-scenario">
                    <div className="chat-playground__toolbar">
                        <Text variant="subheader-2">Clarification question</Text>
                        <Text variant="body-1">Question placement</Text>
                        <SegmentedRadioGroup
                            aria-label="Question placement"
                            value={placement}
                            onUpdate={setPlacement}
                        >
                            <SegmentedRadioGroup.Option value="inline">
                                Inline
                            </SegmentedRadioGroup.Option>
                            <SegmentedRadioGroup.Option value="composer">
                                Replace input
                            </SegmentedRadioGroup.Option>
                        </SegmentedRadioGroup>
                        <Text variant="body-1">Questions</Text>
                        <SegmentedRadioGroup
                            aria-label="Question count"
                            value={questionMode}
                            onUpdate={(value) => {
                                setQuestionMode(value);
                                reset();
                            }}
                        >
                            <SegmentedRadioGroup.Option value="1">
                                1 question
                            </SegmentedRadioGroup.Option>
                            <SegmentedRadioGroup.Option value="3">
                                3 questions
                            </SegmentedRadioGroup.Option>
                        </SegmentedRadioGroup>
                        <PlaybackControls
                            speed={speed}
                            onSpeedChange={setSpeed}
                            busy={playbackState.busy}
                            paused={paused}
                            phase={playbackState.phaseLabel}
                            step={step}
                            previousDisabled={step <= 0}
                            nextDisabled={playbackState.nextDisabled}
                            skipDisabled={!busy}
                            replayDisabled={playbackState.replayDisabled}
                            onPlay={() => sendPrompt('Add accent color settings for workspaces.')}
                            onPrevious={() => seekStep(step - 1)}
                            onNext={() => seekStep(step + 1)}
                            onPause={() => setPaused((value) => !value)}
                            onSkip={skipToEnd}
                            onReplay={() => sendPrompt(prompt)}
                            onReset={reset}
                        />
                    </div>
                    <div className="chat-playground__chat">
                        <AgentChat
                            messages={
                                phase === 'idle'
                                    ? []
                                    : [
                                          {
                                              id: 'question-prompt',
                                              role: 'user',
                                              content: prompt,
                                              timestamp,
                                          },
                                          ...(phase === 'loading'
                                              ? []
                                              : [
                                                    {
                                                        id: 'question-response',
                                                        role: 'assistant' as const,
                                                        content: responseContent,
                                                        timestamp,
                                                        userRating,
                                                    },
                                                ]),
                                      ]
                            }
                            runs={runs}
                            userActions={userActions}
                            assistantActions={assistantActions}
                            showTimestamp
                            status={status}
                            onCreateChat={reset}
                            emptyContent={
                                <div
                                    style={{
                                        padding: 24,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: 12,
                                    }}
                                >
                                    <span>
                                        The assistant will ask a question before continuing.
                                    </span>
                                    <Button
                                        size="l"
                                        view="outlined"
                                        onClick={() =>
                                            sendPrompt('Add accent color settings for workspaces.')
                                        }
                                    >
                                        Add accent color settings for workspaces
                                    </Button>
                                </div>
                            }
                            composer={
                                <ComposerQuestionTransition
                                    question={placement === 'composer' ? question : undefined}
                                    composer={
                                        <AgentComposer
                                            status={status}
                                            onSend={async ({content}) => {
                                                if (phase === 'question') {
                                                    return false;
                                                }
                                                sendPrompt(content);
                                                return undefined;
                                            }}
                                            onStop={() => setPhase('stopped')}
                                        />
                                    }
                                />
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
