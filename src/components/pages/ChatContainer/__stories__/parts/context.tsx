import {useState} from 'react';

import {ChatContainer} from '../..';
import type {TChatMessage, TSubmitData} from '../../../../../types';

import {type Story, defaultDecorators, mockMessages} from './shared';

/**
 * With context items
 */
export const WithContextItems: Story = {
    args: {
        messages: mockMessages,
        promptInputProps: {
            view: 'full',
        },
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(args.messages || []);
        const [contextItems, setContextItems] = useState([
            {id: '1', content: 'ChatContainer.tsx', onRemove: () => {}},
            {id: '2', content: 'types.ts', onRemove: () => {}},
            {id: '3', content: 'README.md', onRemove: () => {}},
        ]);

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
            };
            setMessages((prev) => [...prev, userMessage]);
        };

        const handleRemoveContext = (id: string) => {
            setContextItems((prev) => prev.filter((item) => item.id !== id));
        };

        return (
            <ChatContainer
                {...args}
                messages={messages}
                onSendMessage={handleSendMessage}
                contextItems={contextItems.map((item) => ({
                    ...item,
                    onRemove: () => handleRemoveContext(item.id),
                }))}
            />
        );
    },
    decorators: defaultDecorators,
};

/**
 * With context items and indicator
 */
export const WithContextItemsAndIndicator: Story = {
    args: {
        messages: mockMessages,
        promptInputProps: {
            view: 'full',
            headerProps: {
                showContextIndicator: true,
                contextIndicatorProps: {
                    type: 'percent',
                    usedContext: 75,
                },
            },
        },
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(args.messages || []);
        const [contextItems, setContextItems] = useState([
            {id: '1', content: 'file.tsx', onRemove: () => {}},
            {id: '2', content: 'component.tsx', onRemove: () => {}},
        ]);

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
            };
            setMessages((prev) => [...prev, userMessage]);
        };

        const handleRemoveContext = (id: string) => {
            setContextItems((prev) => prev.filter((item) => item.id !== id));
        };

        return (
            <ChatContainer
                {...args}
                messages={messages}
                onSendMessage={handleSendMessage}
                contextItems={contextItems.map((item) => ({
                    ...item,
                    onRemove: () => handleRemoveContext(item.id),
                }))}
            />
        );
    },
    decorators: defaultDecorators,
};

/**
 * With context indicator and tooltip
 */
export const WithContextIndicatorTooltip: Story = {
    args: {
        messages: mockMessages,
        showContextIndicator: true,
        contextIndicatorProps: {
            type: 'number',
            usedContext: 750,
            maxContext: 1000,
            tooltipContent: '750 / 1000 tokens used',
        },
        promptInputProps: {
            view: 'full',
        },
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(args.messages || []);

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
            };
            setMessages((prev) => [...prev, userMessage]);
        };

        return <ChatContainer {...args} messages={messages} onSendMessage={handleSendMessage} />;
    },
    decorators: defaultDecorators,
};
