import {type ReactNode, useEffect, useState} from 'react';

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
                fileAttachments: [{id: 'file-1', name: 'vm-config.yaml', mimeType: 'text/yaml'}],
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

const FLOATING_HEADER_CLASS = 'chat-container-floating-header-story';

/**
 * Mobile mode with `floatingHeader`: the header is taken out of the flow and the message list
 * scrolls underneath it. The header keeps its own height, so the content is offset by the same
 * value on the consumer side — that is what the story styles below do.
 */
export const MobileFloatingHeader: Story = {
    args: {
        isMobile: true,
        floatingHeader: true,
        texts: {
            disclaimerText: 'AI can make mistakes. We do not train the model on your data.',
        },
        messages: addActionsToMessages(mockChatMessages['1'].slice(0, 4)),
    },
    render: (args) => (
        <div style={{width: 380, height: 748}}>
            <style>{`
                .${FLOATING_HEADER_CLASS} {
                    --g-aikit-chat-container-mobile-header-height: 60px;
                    --g-aikit-chat-container-header-background: transparent;
                }

                .${FLOATING_HEADER_CLASS} .g-aikit-chat-container__content {
                    padding-top: var(--g-aikit-chat-container-mobile-header-height);
                }
            `}</style>
            <ChatContainer
                {...args}
                className={FLOATING_HEADER_CLASS}
                onSendMessage={async () => {}}
            />
        </div>
    ),
};

/**
 * Mobile mode with an oversized suggestions block above the input: a long title and a list of
 * suggestions that together exceed the `--g-aikit-chat-container-mobile-suggestions-max-height`
 * cap. The title gives the space back to the buttons and clips its own content instead of
 * painting it over the list.
 */
export const MobileSuggestionsOverflow: Story = {
    args: {
        isMobile: true,
        messages: addActionsToMessages(mockChatMessages['1'].slice(0, 2)),
        promptInputProps: {
            suggestionsProps: {
                showSuggestions: true,
                suggestTitle:
                    'Confirm the virtual machine before it is created: the configuration below defines the platform, the number of cores, the amount of memory and the disk type, and every one of them changes the final price.',
                suggestions: [
                    {id: '1', title: 'Confirm and create the virtual machine'},
                    {id: '2', title: 'Change the platform'},
                    {id: '3', title: 'Change the number of cores'},
                    {id: '4', title: 'Change the amount of memory'},
                    {id: '5', title: 'Change the disk type'},
                    {id: '6', title: 'Cancel'},
                ],
            },
        },
    },
    render: (args) => (
        <div style={{width: 380, height: 560}}>
            <ChatContainer {...args} onSendMessage={async () => {}} />
        </div>
    ),
};

/**
 * Mobile `floatingHeader` with a header that would grow taller than its token: the header keeps
 * the height of `--g-aikit-chat-container-mobile-header-height`, so the manual content offset
 * stays correct and the header does not cover the top of the conversation.
 */
export const MobileFloatingHeaderTallContent: Story = {
    args: {
        isMobile: true,
        floatingHeader: true,
        messages: addActionsToMessages(mockChatMessages['1'].slice(0, 4)),
        headerProps: {
            title: 'A chat title long enough to wrap onto a second line in mobile mode',
            preview: (
                <div style={{height: 72, width: 72, background: 'var(--g-color-base-generic)'}} />
            ),
        },
    },
    render: (args) => (
        <div style={{width: 380, height: 560}}>
            <style>{`
                .${FLOATING_HEADER_CLASS} {
                    --g-aikit-chat-container-mobile-header-height: 60px;
                    --g-aikit-chat-container-header-background: transparent;
                }

                .${FLOATING_HEADER_CLASS} .g-aikit-chat-container__content {
                    padding-top: var(--g-aikit-chat-container-mobile-header-height);
                }
            `}</style>
            <ChatContainer
                {...args}
                className={FLOATING_HEADER_CLASS}
                onSendMessage={async () => {}}
            />
        </div>
    ),
};

// How much of the screen the on-screen keyboard takes, and what is left of a 748 tall phone.
const KEYBOARD_INSET = 320;
const KEYBOARD_SCREEN_HEIGHT = 720;

const KEYBOARD_DRAFT = [
    'Set up the infrastructure of a basic internet service with several virtual machines',
    'for high availability, a managed database with a replica in another availability zone,',
    'a load balancer in front of the group and a bucket for static files. Keep the whole thing',
    'inside one network, give every machine a public address and tell me what it is going to',
    'cost per month before anything is created. Put the machines behind a single security',
    'group, open nothing but the ports the service needs, and keep the database unreachable',
    'from the outside. Name everything after the service so the console stays readable.',
].join(' ');

/**
 * Keeps `visualViewport.height` short while the children are mounted, the way an on-screen
 * keyboard does. A desktop browser has no keyboard to open, and the layout the chat takes under
 * one is worth looking at, so the viewport is told to report the area the keyboard would leave.
 */
function KeyboardViewportStub({inset, children}: {inset: number; children: ReactNode}) {
    useEffect(() => {
        const viewport = window.visualViewport;

        if (!viewport) {
            return undefined;
        }

        const descriptor = Object.getOwnPropertyDescriptor(viewport, 'height');
        const height = viewport.height - inset;

        Object.defineProperty(viewport, 'height', {configurable: true, get: () => height});
        viewport.dispatchEvent(new Event('resize'));

        return () => {
            if (descriptor) {
                Object.defineProperty(viewport, 'height', descriptor);
            } else {
                Reflect.deleteProperty(viewport, 'height');
            }

            viewport.dispatchEvent(new Event('resize'));
        };
    }, [inset]);

    return <>{children}</>;
}

/**
 * Mobile chat clamped to the short area an open on-screen keyboard leaves: the prompt input holds
 * a draft long enough to fill the screen, so it stops under the header and scrolls inside itself,
 * the welcome mascot gives up its place once nothing is left for it, the suggestions are hidden
 * next to the keyboard, and the disclaimer under the field stays visible.
 */
export const MobileKeyboardOpen: Story = {
    args: {
        isMobile: true,
        adjustToKeyboard: true,
        messages: [],
        welcomeConfig: {
            title: 'AI Assistant',
            description: 'helps with everyday cloud tasks',
            alignment: {title: 'center', description: 'center', image: 'center'},
            suggestions: playgroundSuggestions,
        },
        texts: {
            disclaimerText: 'AI can make mistakes. We do not train the model on your data.',
        },
        promptInputProps: {
            initialValue: KEYBOARD_DRAFT,
        },
    },
    render: (args) => (
        <KeyboardViewportStub inset={KEYBOARD_INSET}>
            <div style={{width: 380, height: KEYBOARD_SCREEN_HEIGHT}}>
                <ChatContainer
                    {...args}
                    mascotConfig={{
                        mascots: {
                            hero: {
                                idle: <TestMascot state="idle" size="8rem" />,
                                reading: <TestMascot state="reading" size="8rem" />,
                            },
                        },
                    }}
                    onSendMessage={async () => {}}
                />
                {/* Место, которое занимает клавиатура: чат до него не доходит */}
                <div
                    style={{
                        height: KEYBOARD_INSET,
                        background: 'var(--g-color-base-generic)',
                    }}
                />
            </div>
        </KeyboardViewportStub>
    ),
};
