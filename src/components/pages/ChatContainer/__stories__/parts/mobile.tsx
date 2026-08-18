import {useEffect, useState} from 'react';

import {ChatContainer} from '../..';
import {TestMascot} from '../../../../../demo/TestMascot';
import type {ChatStatus, ChatType, TChatMessage, TSubmitData} from '../../../../../types';

import {
    type Story,
    addActionsToMessages,
    createMessageId,
    mockChatMessages,
    mockChats,
} from './shared';

const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';

function useIsMobileViewport(): boolean {
    const [isMobile, setIsMobile] = useState(
        () => window.matchMedia(MOBILE_VIEWPORT_QUERY).matches,
    );

    useEffect(() => {
        const mediaQueryList = window.matchMedia(MOBILE_VIEWPORT_QUERY);
        const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

        mediaQueryList.addEventListener('change', handleChange);

        return () => mediaQueryList.removeEventListener('change', handleChange);
    }, []);

    return isMobile;
}

const playgroundSuggestions = [
    {id: '1', title: 'Create a low-cost virtual machine'},
    {id: '2', title: 'Deploy a VPN in the cloud'},
    {
        id: '3',
        title: 'Set up the infrastructure of a basic internet service with several virtual machines for high availability',
    },
    {id: '4', title: 'Suggest an infrastructure option based on Kubernetes'},
];

/**
 * End-to-end mobile adaptivity fixture for manual testing. The chat fills the
 * available viewport, and mobile mode follows the viewport width (`max-width: 767px`),
 * so it can be exercised with the Storybook viewport toolbar or by resizing the window.
 *
 * Includes the welcome mascot, a context chip with the context indicator, the
 * disclaimer, a populated chat history with working open/select/new-chat
 * interactions, and stateful message sending that transitions from the welcome
 * screen to the conversation.
 */
export const MobilePlayground: Story = {
    parameters: {layout: 'fullscreen'},
    render: () => {
        const isMobile = useIsMobileViewport();
        const [messages, setMessages] = useState<TChatMessage[]>([]);
        const [status, setStatus] = useState<ChatStatus>('ready');
        const [chats, setChats] = useState<ChatType[]>(mockChats);
        const [activeChat, setActiveChat] = useState<ChatType | null>(null);
        const [contextItems, setContextItems] = useState([
            {id: 'ctx-1', content: 'catalog-dashboard.json'},
        ]);

        const handleSendMessage = async ({content}: TSubmitData) => {
            const userMessageId = createMessageId('user');
            setMessages((prev) => [
                ...prev,
                {
                    id: userMessageId,
                    role: 'user',
                    content,
                    timestamp: new Date().toISOString(),
                },
            ]);
            setStatus('submitted');
            await new Promise((resolve) => setTimeout(resolve, 800));
            setMessages((prev) => [
                ...prev,
                {
                    id: createMessageId('assistant'),
                    role: 'assistant',
                    content: `Here is what I can do about "${content}":\n\n1. Prepare a plan\n2. Apply the configuration\n\nUse \`yc\` CLI to check the result.`,
                    timestamp: new Date().toISOString(),
                },
            ]);
            setStatus('ready');
        };

        const handleSelectChat = (chat: ChatType) => {
            setActiveChat(chat);
            setMessages(addActionsToMessages(mockChatMessages[chat.id] || []));
        };

        const handleCreateChat = () => {
            setActiveChat(null);
            setMessages([]);
            setStatus('ready');
        };

        const handleDeleteChat = (chat: ChatType) => {
            setChats((prev) => prev.filter((c) => c.id !== chat.id));
            if (activeChat?.id === chat.id) {
                setActiveChat(null);
                setMessages([]);
            }
            return Promise.resolve();
        };

        const handleRemoveContext = (id: string) => {
            setContextItems((prev) => prev.filter((item) => item.id !== id));
        };

        return (
            <div style={{width: '100%', height: '100dvh'}}>
                <ChatContainer
                    isMobile={isMobile}
                    messages={messages}
                    status={status}
                    chats={chats}
                    activeChat={activeChat}
                    showHistory
                    showActionsOnHover
                    texts={{
                        disclaimerText:
                            'AI can make mistakes. We do not train the model on your data.',
                    }}
                    messageListConfig={{showTimestamp: true}}
                    welcomeConfig={{
                        title: 'AI Assistant',
                        description: 'helps with everyday cloud tasks',
                        alignment: {title: 'center', description: 'center', image: 'center'},
                        suggestions: playgroundSuggestions,
                    }}
                    mascotConfig={{
                        mascots: {
                            hero: {
                                idle: <TestMascot state="idle" size="8rem" animated />,
                                reading: <TestMascot state="reading" size="8rem" animated />,
                            },
                        },
                    }}
                    contextItems={contextItems.map((item) => ({
                        ...item,
                        onRemove: () => handleRemoveContext(item.id),
                    }))}
                    promptInputProps={{
                        view: 'full',
                        headerProps: {
                            showContextIndicator: true,
                            contextIndicatorProps: {
                                type: 'percent',
                                usedContext: 42,
                            },
                        },
                    }}
                    onSendMessage={handleSendMessage}
                    onSelectChat={handleSelectChat}
                    onCreateChat={handleCreateChat}
                    onDeleteChat={handleDeleteChat}
                />
            </div>
        );
    },
};

/**
 * Static mobile conversation with the secondary text states: message timestamps,
 * the loader, the context chip with the context indicator and the disclaimer.
 * Used by the visual test for mobile typography of these states.
 */
export const MobileModeWithContext: Story = {
    args: {
        isMobile: true,
        status: 'submitted',
        texts: {
            disclaimerText: 'AI can make mistakes. We do not train the model on your data.',
        },
        messageListConfig: {showTimestamp: true},
        messages: addActionsToMessages([
            {
                id: '1',
                role: 'user',
                content: 'Create a low-cost virtual machine',
                timestamp: '2026-01-15T12:30:00Z',
            },
            {
                id: '2',
                role: 'assistant',
                content: 'A burstable instance with a 20 GB network HDD is the cheapest option.',
                timestamp: '2026-01-15T12:31:00Z',
            },
        ]),
        promptInputProps: {
            view: 'full',
            headerProps: {
                showContextIndicator: true,
                contextIndicatorProps: {
                    type: 'percent',
                    usedContext: 42,
                },
            },
        },
    },
    render: (args) => (
        <div style={{width: 380, height: 748}}>
            <ChatContainer
                {...args}
                onSendMessage={async () => {}}
                contextItems={[
                    {id: 'ctx-1', content: 'catalog-dashboard.json', onRemove: () => {}},
                ]}
            />
        </div>
    ),
};
