import {type PropsWithChildren, useState} from 'react';

import {Magnifier} from '@gravity-ui/icons';
import {Button, Icon, ThemeProvider} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {
    ThinkingMessageGroup,
    type ThinkingStep,
    type ThinkingStepStatus,
    thinkingMessageToStep,
} from '..';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import {AssistantMessage} from '../../AssistantMessage';
import {UserMessage} from '../../UserMessage';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/ThinkingMessageGroup',
    component: ThinkingMessageGroup,
    parameters: {docs: {page: MDXDocs}},
} satisfies Meta<typeof ThinkingMessageGroup>;
type Story = StoryObj<typeof ThinkingMessageGroup>;
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

function CompactFrame({children, width = 520}: PropsWithChildren<{width?: number}>) {
    return (
        <div
            style={{
                width,
                maxWidth: '100%',
                boxSizing: 'border-box',
                padding: 'var(--g-spacing-4)',
                background: 'var(--g-color-base-background)',
            }}
        >
            {children}
        </div>
    );
}

export const Playground: Story = {
    args: {...compactData, format: 'markdown'},
    render: (args) => (
        <CompactFrame>
            <ThinkingMessageGroup {...args} />
        </CompactFrame>
    ),
};

export const CompactExpanded: Story = {
    render: () => (
        <CompactFrame>
            <ThinkingMessageGroup {...compactData} defaultExpanded format="markdown" />
        </CompactFrame>
    ),
};

export const CompactWithoutDetails: Story = {
    render: () => (
        <ThinkingMessageGroup
            steps={[
                {
                    id: 'custom',
                    type: 'unregistered',
                    title: 'Processing the request',
                    status: 'thinking',
                },
            ]}
            activeStepId="custom"
            status="thinking"
        />
    ),
};

export const CompactCustomRendering: Story = {
    render: () => (
        <CompactFrame>
            <ThinkingMessageGroup
                {...compactData}
                defaultExpanded
                renderSummary={(completed: ThinkingStep[]) => `${completed.length} sources checked`}
                renderStepContent={(step: ThinkingStep) => (
                    <TextContent title={step.title ?? step.id} />
                )}
            />
        </CompactFrame>
    ),
};

function TextContent({title}: {title: string}) {
    return <p>Application-provided details: {title}</p>;
}

export const CompactTerminalStates: Story = {
    render: () => (
        <CompactFrame>
            {(['thought', 'error', 'cancelled', 'paused'] as const).map((status) => (
                <ShowcaseItem title={status} key={status}>
                    <ThinkingMessageGroup {...compactData} status={status} qa={status} />
                </ShowcaseItem>
            ))}
        </CompactFrame>
    ),
};

export const CompactNarrow: Story = {
    render: () => (
        <CompactFrame width={240}>
            <ThinkingMessageGroup
                {...compactData}
                steps={Array.from({length: 50}, (_, index) => ({
                    id: String(index),
                    type: 'search',
                    title: 'Searching a very long documentation reference without increasing the compact block height',
                    content: 'A_very_long_reference_'.repeat(30),
                    status: index === 49 ? ('thinking' as const) : ('thought' as const),
                }))}
                activeStepId="49"
            />
        </CompactFrame>
    ),
};

export const CompactDark: Story = {
    render: () => (
        <ThemeProvider theme="dark">
            <CompactFrame>
                <ThinkingMessageGroup {...compactData} defaultExpanded format="markdown" />
            </CompactFrame>
        </ThemeProvider>
    ),
};

function CompactStreamingDemo({controlled = false}: {controlled?: boolean}) {
    const [steps, setSteps] = useState(compactSteps);
    const [status, setStatus] = useState<ThinkingStepStatus>('thinking');
    const [expanded, setExpanded] = useState(false);

    return (
        <CompactFrame>
            <Button
                onClick={() =>
                    setSteps((current) =>
                        current.map((step) =>
                            step.id === 'search'
                                ? {...step, content: 'Updated streaming details'}
                                : step,
                        ),
                    )
                }
            >
                Append details
            </Button>
            <Button
                onClick={() => {
                    setStatus('thought');
                    setSteps((current) => current.map((step) => ({...step, status: 'thought'})));
                }}
            >
                Complete
            </Button>
            <ThinkingMessageGroup
                {...compactData}
                steps={steps}
                status={status}
                expanded={controlled ? expanded : undefined}
                onExpandedChange={setExpanded}
            />
        </CompactFrame>
    );
}

export const CompactStreaming: Story = {
    render: () => <CompactStreamingDemo />,
};

export const CompactControlled: Story = {
    render: () => <CompactStreamingDemo controlled />,
};

export const InAssistantMessage: Story = {
    render: () => (
        <CompactFrame width={640}>
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
        </CompactFrame>
    ),
};

export const Empty: Story = {render: () => <ThinkingMessageGroup steps={[]} />};
export const Completed: Story = {
    render: () => (
        <CompactFrame>
            <ThinkingMessageGroup
                steps={compactSteps.map((step) => ({...step, status: 'thought'}))}
            />
        </CompactFrame>
    ),
};
export const SingleCompleted: Story = {
    args: {
        steps: [{id: 'one', type: 'custom', title: 'Checked the documentation', status: 'thought'}],
    },
};
export const Legacy: Story = {
    render: () => (
        <CompactFrame>
            <ThinkingMessageGroup
                defaultExpanded
                format="markdown"
                steps={[
                    thinkingMessageToStep('legacy', {
                        content: ['**First paragraph**', 'Second paragraph'],
                        status: 'thought',
                        enabledCopy: true,
                    }),
                ]}
            />
        </CompactFrame>
    ),
};
