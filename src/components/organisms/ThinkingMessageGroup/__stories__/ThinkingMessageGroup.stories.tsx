import {useState} from 'react';

import {Magnifier} from '@gravity-ui/icons';
import {Button, Icon, ThemeProvider} from '@gravity-ui/uikit';
import type {Decorator, Meta, StoryObj} from '@storybook/react-webpack5';

import {
    ThinkingMessageGroup,
    type ThinkingStep,
    type ThinkingStepStatus,
    thinkingMessageToStep,
} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import {AssistantMessage} from '../../AssistantMessage';
import {UserMessage} from '../../UserMessage';

import MDXDocs from './Docs.mdx';

type Story = StoryObj<typeof ThinkingMessageGroup>;

const frameDecorator: Decorator = (Story, context) => {
    const showcase = (
        <Showcase>
            <ShowcaseItem title={context.name} width="100%">
                {context.parameters.description && (
                    <p style={{marginBlockStart: 0, maxWidth: 600}}>
                        {context.parameters.description}
                    </p>
                )}
                <ContentWrapper
                    width={context.parameters.frameWidth ?? 600}
                    maxWidth="100%"
                    boxSizing="border-box"
                >
                    <Story />
                </ContentWrapper>
            </ShowcaseItem>
        </Showcase>
    );
    return context.parameters.dark ? (
        <ThemeProvider theme="dark" scoped>
            {showcase}
        </ThemeProvider>
    ) : (
        showcase
    );
};

const defaultDecorators = [frameDecorator] satisfies Story['decorators'];

export default {
    title: 'organisms/ThinkingMessageGroup',
    component: ThinkingMessageGroup,
    decorators: defaultDecorators,
    parameters: {docs: {page: MDXDocs}},
    argTypes: {
        status: {
            control: 'select',
            options: ['thinking', 'thought', 'error', 'cancelled', 'paused'],
        },
        format: {control: 'select', options: ['plain', 'markdown']},
        maxHistoryHeight: {
            control: 'text',
            description: 'Maximum expanded history height (default: 480px). Use none for no limit.',
            table: {defaultValue: {summary: '480px'}},
        },
        onExpandedChange: {action: 'expanded changed'},
        renderSummary: {control: false},
        renderStepContent: {control: false},
    },
} satisfies Meta<typeof ThinkingMessageGroup>;

const compactSteps: ThinkingStep[] = [
    {
        id: 'analyze',
        type: 'reasoning',
        title: 'Analyzed the request',
        status: 'thought',
        content: 'The request needs information from the documentation.',
    },
    {
        id: 'search',
        type: 'search',
        title: 'Searching the documentation',
        status: 'thinking',
        content: 'Checking **relevant sources** and comparing the available options.',
    },
];

const compactData = {
    steps: compactSteps,
    status: 'thinking' as const,
    activeStepId: 'search',
    stepTypes: {
        reasoning: {label: 'Reasoning'},
        search: {label: 'Documentation search', icon: <Icon data={Magnifier} size={16} />},
    },
};

export const Playground: Story = {
    args: {...compactData, format: 'markdown', maxHistoryHeight: '480px'},
};

export const CompactExpanded: Story = {
    name: 'Expanded History',
    args: {...compactData, defaultExpanded: true, format: 'markdown'},
};

export const CompactWithoutDetails: Story = {
    name: 'Running Without Details',
    parameters: {
        description:
            'A running status with no details to reveal, so the heading has no expansion button.',
    },
    args: {
        steps: [
            {
                id: 'custom',
                type: 'unregistered',
                title: 'Processing the request',
                status: 'thinking',
            },
        ],
        activeStepId: 'custom',
        status: 'thinking',
    },
};

export const CompactCustomRendering: Story = {
    name: 'Custom Rendering',
    args: {...compactData, defaultExpanded: true},
    render: (args) => (
        <ThinkingMessageGroup
            {...args}
            renderSummary={(completed: ThinkingStep[]) => `${completed.length} sources checked`}
            renderStepContent={(step: ThinkingStep) => (
                <TextContent title={step.title ?? step.id} />
            )}
        />
    ),
};

function TextContent({title}: {title: string}) {
    return <p>Application-provided details: {title}</p>;
}

export const CompactTerminalStates: Story = {
    name: 'Completion States',
    render: () => (
        <Showcase direction="column">
            {(['thought', 'error', 'cancelled', 'paused'] as const).map((status) => (
                <ShowcaseItem title={status} key={status}>
                    <ThinkingMessageGroup
                        {...compactData}
                        steps={compactSteps.map((step) =>
                            step.status === 'thinking' ? {...step, status} : step,
                        )}
                        status={status}
                        format="markdown"
                        qa={status}
                    />
                </ShowcaseItem>
            ))}
        </Showcase>
    ),
};

export const CompactNarrow: Story = {
    name: 'Narrow Container',
    parameters: {
        frameWidth: 240,
        description:
            'Stress case: 50 steps and long unbroken text in a 240px container. Expand the history to scroll it; its default maximum height is 480px.',
    },
    args: {
        ...compactData,
        steps: Array.from({length: 50}, (_, index) => ({
            id: String(index),
            type: 'search',
            title: 'Searching a very long documentation reference without increasing the compact block height',
            content: 'A_very_long_reference_'.repeat(30),
            status: index === 49 ? 'thinking' : 'thought',
        })),
        activeStepId: '49',
        defaultExpanded: true,
    },
};

export const CompactDark: Story = {
    name: 'Dark Theme',
    parameters: {dark: true},
    args: {...compactData, defaultExpanded: true, format: 'markdown'},
};

export const CustomHistoryHeight: Story = {
    name: 'History Height',
    parameters: {
        description:
            'Override maxHistoryHeight in Controls: try 240px, 600px, 60vh, or none. The default without an override is 480px.',
    },
    args: {
        maxHistoryHeight: '240px',
        defaultExpanded: true,
        steps: Array.from({length: 12}, (_, index) => ({
            id: `source-${index}`,
            type: 'search',
            title: `Checked source ${index + 1}`,
            content: 'Read the documentation and compared the relevant configuration options.',
            status: 'thought',
        })),
        stepTypes: compactData.stepTypes,
    },
};

function ProgressUpdatesExample({controlled = false}: {controlled?: boolean}) {
    const [steps, setSteps] = useState(compactSteps);
    const [status, setStatus] = useState<ThinkingStepStatus>('thinking');
    const [expanded, setExpanded] = useState(true);
    const [fragmentCount, setFragmentCount] = useState(0);
    const [demoVersion, setDemoVersion] = useState(0);
    const isRunning = status === 'thinking';

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--g-spacing-4)'}}>
            <div>
                <p style={{marginBlockStart: 0}}>
                    See how the history changes while an assistant prepares a response. Use the
                    buttons to add text to the current step, start the next step, or finish the
                    response. Each click updates local example data; no backend is connected.
                </p>
                {controlled && (
                    <p>
                        The application owns the expanded state. Use the external toggle or the
                        component heading; both update the same state.
                    </p>
                )}
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 'var(--g-spacing-2)'}}>
                    <Button
                        disabled={!isRunning}
                        title="Append a new text fragment to the active step without replacing its content"
                        onClick={() => {
                            setSteps((current) =>
                                current.map((step) =>
                                    step.status === 'thinking'
                                        ? {
                                              ...step,
                                              content: `${step.content}\n\nDetail ${fragmentCount + 1}: Checked another configuration option against the documentation.`,
                                          }
                                        : step,
                                ),
                            );
                            setFragmentCount((current) => current + 1);
                        }}
                    >
                        Add text fragment
                    </Button>
                    <Button
                        disabled={!isRunning}
                        title="Complete the active step and append a new running step"
                        onClick={() =>
                            setSteps((current) => [
                                ...current.map((step) =>
                                    step.status === 'thinking'
                                        ? {...step, status: 'thought' as const}
                                        : step,
                                ),
                                {
                                    id: `source-${current.length}`,
                                    type: 'search',
                                    title: `Checking source ${current.length}`,
                                    content:
                                        'Reading the next source and comparing its recommendations.',
                                    status: 'thinking',
                                },
                            ])
                        }
                    >
                        Add next step
                    </Button>
                    <Button
                        disabled={!isRunning}
                        title="Mark the response and its running step as completed"
                        onClick={() => {
                            setStatus('thought');
                            setSteps((current) =>
                                current.map((step) => ({...step, status: 'thought'})),
                            );
                        }}
                    >
                        Complete response
                    </Button>
                    <Button
                        title="Restore the initial two steps and expanded history"
                        onClick={() => {
                            setSteps(compactSteps);
                            setStatus('thinking');
                            setFragmentCount(0);
                            setExpanded(true);
                            setDemoVersion((current) => current + 1);
                        }}
                    >
                        Start over
                    </Button>
                    {controlled && (
                        <Button onClick={() => setExpanded((current) => !current)}>
                            {expanded ? 'Collapse history externally' : 'Expand history externally'}
                        </Button>
                    )}
                </div>
                <p style={{marginBlockEnd: 0}}>
                    Response status: {isRunning ? 'running' : 'completed'} · {steps.length} steps
                    {controlled && ` · application expanded = ${expanded}`}
                </p>
            </div>
            <ThinkingMessageGroup
                key={demoVersion}
                format="markdown"
                stepTypes={compactData.stepTypes}
                steps={steps}
                status={status}
                defaultExpanded
                expanded={controlled ? expanded : undefined}
                onExpandedChange={setExpanded}
            />
        </div>
    );
}

export const CompactStreaming: Story = {
    name: 'Progress Updates',
    render: () => <ProgressUpdatesExample />,
};

export const CompactControlled: Story = {
    name: 'Controlled Expansion',
    render: () => <ProgressUpdatesExample controlled />,
};

export const InAssistantMessage: Story = {
    name: 'Grouped Assistant Message',
    parameters: {frameWidth: 640},
    render: () => (
        <>
            <UserMessage content="How should we display the assistant's progress?" />
            <AssistantMessage
                id="response"
                thinkingMessageView="grouped"
                content={[
                    {
                        id: 'reasoning-1',
                        type: 'thinking',
                        data: {content: 'Analyzing the request.', status: 'thought'},
                    },
                    {
                        id: 'reasoning-2',
                        type: 'thinking',
                        data: {
                            title: 'Checking documentation',
                            content: '**Relevant sources** are being checked.',
                            status: 'thinking',
                        },
                    },
                ]}
            />
        </>
    ),
};

export const Completed: Story = {
    name: 'Completed History',
    parameters: {
        description:
            'Completed work stays expandable. Compare multiple steps, one step with details, and a title-only step when the backend supplies no details.',
    },
    render: () => (
        <Showcase direction="column">
            <ShowcaseItem title="Several completed steps">
                <ThinkingMessageGroup
                    steps={compactSteps.map((step) => ({...step, status: 'thought'}))}
                    stepTypes={compactData.stepTypes}
                    format="markdown"
                />
            </ShowcaseItem>
            <ShowcaseItem title="One completed step with details">
                <ThinkingMessageGroup steps={[{...compactSteps[0], status: 'thought'}]} />
            </ShowcaseItem>
            <ShowcaseItem title="One completed step without details">
                <ThinkingMessageGroup
                    steps={[
                        {
                            id: 'one',
                            type: 'custom',
                            title: 'Checked the documentation',
                            status: 'thought',
                        },
                    ]}
                />
            </ShowcaseItem>
        </Showcase>
    ),
};

export const Legacy: Story = {
    name: 'Legacy Data Migration',
    parameters: {
        description:
            'The new ThinkingMessageGroup renders an existing ThinkingMessage payload through thinkingMessageToStep. Two paragraphs remain one step.',
    },
    args: {
        defaultExpanded: true,
        format: 'markdown',
        steps: [
            thinkingMessageToStep('legacy', {
                content: ['**First paragraph**', 'Second paragraph'],
                status: 'thought',
                enabledCopy: true,
            }),
        ],
    },
};
