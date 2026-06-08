/* eslint-disable no-console */
import React, {Suspense, lazy, useState} from 'react';

import {Button, Card, Flex, Text} from '@gravity-ui/uikit';

import {ChatContainer} from '../..';
import type {
    ChatStatus,
    TAssistantMessage,
    TChatMessage,
    TMessageContent,
    TSubmitData,
} from '../../../../../types';
import {
    type MessageContentComponentProps,
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../../../utils/messageTypeRegistry';

import type {ChartMessageContent} from './chartMessageTypes';
import {type Story, defaultDecorators} from './shared';

// ---------------------------------------------------------------------------
// Custom message types example
//
// ChatContainer renders assistant message content through a registry of
// renderers (see `messageTypeRegistry`). Built-in `text` / `thinking` / `tool`
// parts always work; here we register two extra content types:
//   - `chart` — a minimal CSS-only bar chart driven by message parameters
//   - `cards` — a list of cards (title + description + button)
//
// The registry is passed to ChatContainer via `messageListConfig`.
// Demo-only styles live inline in this story file, not in component SCSS.
// ---------------------------------------------------------------------------

// The `chart` content type is shared with the lazily-loaded renderer in `LazyChartView`.

/** Single card of the `cards` message type. */
interface CardItem {
    title: string;
    description: string;
    buttonText: string;
}

/** Data payload for the `cards` custom message type. */
interface CardsMessageData {
    cards: CardItem[];
}

type CardsMessageContent = TMessageContent<'cards', CardsMessageData>;

/** Union of the custom content types used in this example. */
type CustomMessageContent = ChartMessageContent | CardsMessageContent;

/**
 * Renderer for the `chart` message type — a minimal vertical bar chart drawn
 * purely with CSS. Bar heights are scaled to the largest value in the data.
 */
const ChartMessageView: React.FC<MessageContentComponentProps<ChartMessageContent>> = ({part}) => {
    const {title, bars} = part.data;
    const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

    return (
        <div
            style={{
                padding: '16px',
                border: '1px solid var(--g-color-line-generic)',
                borderRadius: '8px',
                backgroundColor: 'var(--g-color-base-float)',
                maxWidth: '420px',
            }}
        >
            {title ? <div style={{marginBottom: '16px', fontWeight: 600}}>{title}</div> : null}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '12px',
                    height: '160px',
                }}
            >
                {bars.map((bar) => (
                    <div
                        key={bar.label}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            height: '100%',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                flex: 1,
                                width: '100%',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    marginBottom: '4px',
                                    color: 'var(--g-color-text-secondary)',
                                }}
                            >
                                {bar.value}
                            </div>
                            <div
                                style={{
                                    height: `${(bar.value / maxValue) * 100}%`,
                                    minHeight: '4px',
                                    borderRadius: '4px 4px 0 0',
                                    backgroundColor: bar.color ?? 'var(--g-color-base-brand)',
                                    transition: 'height 0.3s ease',
                                }}
                            />
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                textAlign: 'center',
                                marginTop: '8px',
                                color: 'var(--g-color-text-secondary)',
                            }}
                        >
                            {bar.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Renderer for the `cards` message type — a responsive list of cards built
 * with gravity-uikit components (Card, Text, Button).
 */
const CardsMessageView: React.FC<MessageContentComponentProps<CardsMessageContent>> = ({part}) => {
    const {cards} = part.data;

    return (
        <Flex gap={2} wrap style={{maxWidth: '480px'}}>
            {cards.map((card) => (
                <Card
                    key={card.title}
                    view="outlined"
                    style={{padding: '16px', flex: '1 1 200px', minWidth: '200px'}}
                >
                    <Flex direction="column" gap={2} style={{height: '100%'}}>
                        <Text variant="subheader-2">{card.title}</Text>
                        <Text variant="body-1" color="secondary" style={{flex: 1}}>
                            {card.description}
                        </Text>
                        <div>
                            <Button
                                view="action"
                                onClick={() => console.log(`Card action: ${card.title}`)}
                            >
                                {card.buttonText}
                            </Button>
                        </div>
                    </Flex>
                </Card>
            ))}
        </Flex>
    );
};

/**
 * Registry wiring the custom content types to their renderers. Built-in types
 * (`text`, etc.) are merged in automatically by AssistantMessage.
 */
const customMessageRendererRegistry: MessageRendererRegistry = createMessageRendererRegistry();
registerMessageRenderer<ChartMessageContent>(customMessageRendererRegistry, 'chart', {
    component: ChartMessageView,
});
registerMessageRenderer<CardsMessageContent>(customMessageRendererRegistry, 'cards', {
    component: CardsMessageView,
});

/** Pre-built assistant message containing a `chart` part. */
const chartAssistantMessage: TAssistantMessage<CustomMessageContent> = {
    id: 'custom-chart',
    role: 'assistant',
    timestamp: new Date().toISOString(),
    content: [
        {
            type: 'text',
            data: {text: 'Here is a bar chart of sales by quarter:'},
        },
        {
            type: 'chart',
            data: {
                title: 'Sales by quarter, $K',
                bars: [
                    {label: 'Q1', value: 24},
                    {label: 'Q2', value: 38},
                    {label: 'Q3', value: 31, color: 'var(--g-color-base-positive-heavy)'},
                    {label: 'Q4', value: 52, color: 'var(--g-color-base-positive-heavy)'},
                ],
            },
        },
    ],
};

/** Pre-built assistant message containing a `cards` part. */
const cardsAssistantMessage: TAssistantMessage<CustomMessageContent> = {
    id: 'custom-cards',
    role: 'assistant',
    timestamp: new Date().toISOString(),
    content: [
        {
            type: 'text',
            data: {text: 'I found a few plans that might fit your needs:'},
        },
        {
            type: 'cards',
            data: {
                cards: [
                    {
                        title: 'Starter',
                        description: 'For individuals getting started. Includes core features.',
                        buttonText: 'Choose Starter',
                    },
                    {
                        title: 'Pro',
                        description: 'For growing teams that need collaboration and analytics.',
                        buttonText: 'Choose Pro',
                    },
                    {
                        title: 'Enterprise',
                        description: 'Advanced security, SSO and dedicated support.',
                        buttonText: 'Contact sales',
                    },
                ],
            },
        },
    ],
};

/**
 * Demonstrates rendering of custom assistant message types inside ChatContainer.
 *
 * The chat starts with a `chart` and a `cards` message already rendered. Try
 * the suggestions (or type `chart` / `cards`) to append more custom messages.
 */
export const WithCustomMessageTypes: Story = {
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>([
            {
                id: 'user-chart',
                role: 'user',
                content: 'Show me sales by quarter as a chart',
                timestamp: new Date().toISOString(),
            },
            chartAssistantMessage as unknown as TChatMessage,
            {
                id: 'user-cards',
                role: 'user',
                content: 'What pricing plans do you offer?',
                timestamp: new Date().toISOString(),
            },
            cardsAssistantMessage as unknown as TChatMessage,
        ]);
        const [status, setStatus] = useState<ChatStatus>('ready');

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMessage]);

            setStatus('streaming');
            await new Promise((resolve) => setTimeout(resolve, 400));

            // Pick a response type based on simple keyword matching
            const normalized = data.content.toLowerCase();
            let assistantMessage: TAssistantMessage<CustomMessageContent>;

            if (normalized.includes('card') || normalized.includes('plan')) {
                assistantMessage = {...cardsAssistantMessage, id: Date.now().toString()};
            } else if (normalized.includes('chart') || normalized.includes('sales')) {
                assistantMessage = {...chartAssistantMessage, id: Date.now().toString()};
            } else {
                assistantMessage = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    timestamp: new Date().toISOString(),
                    content:
                        'Try asking for a "chart" or "cards" to see the custom message types in action.',
                };
            }

            setMessages((prev) => [...prev, assistantMessage as unknown as TChatMessage]);
            setStatus('ready');
        };

        return (
            <ChatContainer
                {...args}
                messages={messages}
                status={status}
                onSendMessage={handleSendMessage}
                messageListConfig={{
                    messageRendererRegistry: customMessageRendererRegistry,
                }}
                welcomeConfig={{
                    title: 'Custom message types',
                    description: 'Ask for a chart or cards to render custom content.',
                    suggestions: [
                        {id: 'chart', title: 'Show me a sales chart'},
                        {id: 'cards', title: 'What pricing plans do you offer?'},
                    ],
                }}
            />
        );
    },
    decorators: defaultDecorators,
};

// ---------------------------------------------------------------------------
// Lazily code-split custom message type
//
// A registered renderer is an ordinary React component, so it can be loaded with
// `React.lazy(() => import('./LazyChartView'))`. The renderer below wraps the lazy
// component in its own `Suspense` boundary, so the heavy module is fetched only when
// a `chart` message is actually rendered (and split into a separate chunk by the
// consumer's bundler). Wrapping `Suspense` inside the renderer keeps the boundary
// local — host code doesn't need to add one around the whole chat.
// ---------------------------------------------------------------------------

const LazyChartView = lazy(() => import('./LazyChartView'));

const LazyChartRenderer: React.FC<MessageContentComponentProps<ChartMessageContent>> = (props) => (
    <Suspense
        fallback={
            <Text color="secondary" variant="body-1">
                Loading chart…
            </Text>
        }
    >
        <LazyChartView {...props} />
    </Suspense>
);

const lazyMessageRendererRegistry: MessageRendererRegistry = createMessageRendererRegistry();
registerMessageRenderer<ChartMessageContent>(lazyMessageRendererRegistry, 'chart', {
    component: LazyChartRenderer,
});

/**
 * Same custom `chart` type as above, but its renderer is loaded lazily via `React.lazy`
 * so the chart module ships in a separate chunk and is fetched on first use.
 */
export const WithLazyCustomMessageType: Story = {
    render: (args) => {
        const messages: TChatMessage[] = [
            {
                id: 'user-lazy-chart',
                role: 'user',
                content: 'Show me sales by quarter as a chart',
                timestamp: new Date().toISOString(),
            },
            chartAssistantMessage as unknown as TChatMessage,
        ];

        return (
            <ChatContainer
                {...args}
                messages={messages}
                status="ready"
                onSendMessage={async () => undefined}
                messageListConfig={{
                    messageRendererRegistry: lazyMessageRendererRegistry,
                }}
            />
        );
    },
    decorators: defaultDecorators,
};
