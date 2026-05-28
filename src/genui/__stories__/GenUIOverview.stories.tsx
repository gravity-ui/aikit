/* eslint-disable no-console */

import {useState} from 'react';

import {Button} from '@gravity-ui/uikit';
import {Meta, StoryFn} from '@storybook/react-webpack5';

import {AssistantMessage} from '../../components/organisms/AssistantMessage';
import {ContentWrapper} from '../../demo/ContentWrapper';
import {Showcase} from '../../demo/Showcase';
import {ShowcaseItem} from '../../demo/ShowcaseItem';
import type {
    TAssistantMessage,
    ToolCallMessageContent,
    ToolResultMessageContent,
} from '../../types/messages';
import {
    type GenUIComponentProps,
    type GenUIToolRegistry,
    createGenUIToolRegistry,
    registerGenUITool,
} from '../index';

type WeatherArgs = {
    city: string;
    units?: 'c' | 'f';
};

type WeatherResult = {acknowledged: true};

function WeatherCard({
    args,
    submitResult,
    previousResult,
}: GenUIComponentProps<WeatherArgs, WeatherResult>) {
    return (
        <div
            style={{
                padding: 12,
                border: '1px solid var(--g-color-line-generic, rgba(0,0,0,0.15))',
                borderRadius: 8,
                background: 'var(--g-color-base-float, #fff)',
                display: 'inline-flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 200,
            }}
        >
            <strong>Weather · {args.city}</strong>
            <span style={{color: 'var(--g-color-text-secondary, rgba(0,0,0,0.6))'}}>
                Units: {args.units ?? 'c'}
            </span>
            {previousResult ? (
                <em>acknowledged</em>
            ) : (
                <Button view="action" onClick={() => submitResult({acknowledged: true})}>
                    Got it
                </Button>
            )}
        </div>
    );
}

type ApprovalArgs = {
    summary: string;
};

type ApprovalResult = {approved: boolean};

function ApprovalCard({
    args,
    submitResult,
    previousResult,
}: GenUIComponentProps<ApprovalArgs, ApprovalResult>) {
    return (
        <div
            style={{
                padding: 12,
                border: '1px solid var(--g-color-line-generic, rgba(0,0,0,0.15))',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}
        >
            <span>{args.summary}</span>
            {previousResult ? (
                <em>{previousResult.approved ? 'Approved' : 'Rejected'}</em>
            ) : (
                <div style={{display: 'flex', gap: 8}}>
                    <Button view="action" onClick={() => submitResult({approved: true})}>
                        Approve
                    </Button>
                    <Button onClick={() => submitResult({approved: false})}>Reject</Button>
                </div>
            )}
        </div>
    );
}

function makeRegistry(): GenUIToolRegistry {
    const registry = createGenUIToolRegistry();
    registerGenUITool<WeatherArgs, WeatherResult>(registry, {
        name: 'weather.show',
        description: 'Render a weather card for a city.',
        schema: {
            type: 'object',
            properties: {
                city: {type: 'string'},
                units: {type: 'string', enum: ['c', 'f']},
            },
            required: ['city'],
            additionalProperties: false,
        },
        component: WeatherCard,
    });
    registerGenUITool<ApprovalArgs, ApprovalResult>(registry, {
        name: 'approval.request',
        description: 'Ask the user to approve or reject a proposed action.',
        schema: {
            type: 'object',
            properties: {summary: {type: 'string'}},
            required: ['summary'],
            additionalProperties: false,
        },
        component: ApprovalCard,
    });
    return registry;
}

export default {
    title: 'genui/Overview',
    parameters: {layout: 'padded'},
} as Meta;

const callPart = (
    toolCallId: string,
    toolName: string,
    args: Record<string, unknown>,
    status: ToolCallMessageContent['data']['status'] = 'input-available',
): ToolCallMessageContent => ({
    type: 'tool-call',
    data: {toolCallId, toolName, args, status},
});

export const Lifecycle: StoryFn = () => {
    const registry = makeRegistry();

    const streamingMessage: TAssistantMessage = {
        id: 'm-streaming',
        role: 'assistant',
        content: [
            {type: 'text', data: {text: 'Looking up the weather…'}},
            {
                type: 'tool-call',
                data: {
                    toolCallId: 'c1',
                    toolName: 'weather.show',
                    status: 'input-streaming',
                    partialArgsText: '{ "city": "Ber',
                },
            },
        ],
    };

    const readyMessage: TAssistantMessage = {
        id: 'm-ready',
        role: 'assistant',
        content: [
            {type: 'text', data: {text: 'Here is the forecast:'}},
            callPart('c2', 'weather.show', {city: 'Berlin', units: 'c'}),
        ],
    };

    const errorMessage: TAssistantMessage = {
        id: 'm-error',
        role: 'assistant',
        content: [
            {
                type: 'tool-call',
                data: {
                    toolCallId: 'c3',
                    toolName: 'weather.show',
                    status: 'output-error',
                    error: {message: 'API quota exhausted'},
                },
            },
        ],
    };

    const unknownMessage: TAssistantMessage = {
        id: 'm-unknown',
        role: 'assistant',
        content: [callPart('c4', 'totally.unknown', {payload: 1})],
    };

    const invalidMessage: TAssistantMessage = {
        id: 'm-invalid',
        role: 'assistant',
        content: [
            // Missing required `city`
            callPart('c5', 'weather.show', {units: 'c'}),
        ],
    };

    return (
        <Showcase>
            <ShowcaseItem title="input-streaming">
                <ContentWrapper width="480px">
                    <AssistantMessage
                        content={streamingMessage.content}
                        id={streamingMessage.id}
                        genUIRegistry={registry}
                    />
                </ContentWrapper>
            </ShowcaseItem>
            <ShowcaseItem title="input-available">
                <ContentWrapper width="480px">
                    <AssistantMessage
                        content={readyMessage.content}
                        id={readyMessage.id}
                        genUIRegistry={registry}
                    />
                </ContentWrapper>
            </ShowcaseItem>
            <ShowcaseItem title="output-error">
                <ContentWrapper width="480px">
                    <AssistantMessage
                        content={errorMessage.content}
                        id={errorMessage.id}
                        genUIRegistry={registry}
                    />
                </ContentWrapper>
            </ShowcaseItem>
            <ShowcaseItem title="unknown-tool fallback">
                <ContentWrapper width="480px">
                    <AssistantMessage
                        content={unknownMessage.content}
                        id={unknownMessage.id}
                        genUIRegistry={registry}
                    />
                </ContentWrapper>
            </ShowcaseItem>
            <ShowcaseItem title="schema-validation failure">
                <ContentWrapper width="480px">
                    <AssistantMessage
                        content={invalidMessage.content}
                        id={invalidMessage.id}
                        genUIRegistry={registry}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        </Showcase>
    );
};

export const RoundTrip: StoryFn = () => {
    const registry = makeRegistry();

    const [resultEvents, setResultEvents] = useState<
        Array<{toolCallId: string; toolName: string; result: unknown}>
    >([]);

    const content: TAssistantMessage['content'] = [
        {type: 'text', data: {text: 'Please confirm:'}},
        callPart('c-approve', 'approval.request', {summary: 'Delete the staging database'}),
        // Re-hydrated example: matching result already in the message
        callPart('c-weather', 'weather.show', {city: 'Berlin'}, 'output-available'),
        {
            type: 'tool-result',
            data: {
                toolCallId: 'c-weather',
                toolName: 'weather.show',
                result: {acknowledged: true},
            },
        } as ToolResultMessageContent,
    ];

    return (
        <ContentWrapper width="540px">
            <AssistantMessage
                content={content}
                id="round-trip"
                genUIRegistry={registry}
                onToolResult={(event) => {
                    setResultEvents((prev) => [
                        ...prev,
                        {
                            toolCallId: event.toolCallId,
                            toolName: event.toolName,
                            result: event.result,
                        },
                    ]);
                }}
                onGenUIError={(event) => console.warn('genui error', event)}
            />
            <pre style={{marginTop: 16, fontSize: 12}}>
                {resultEvents.length === 0
                    ? '// onToolResult events will appear here'
                    : JSON.stringify(resultEvents, null, 2)}
            </pre>
        </ContentWrapper>
    );
};
