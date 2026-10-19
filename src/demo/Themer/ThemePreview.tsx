import {useState} from 'react';

import {PortalProvider, ThemeProvider} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit-themer';

import {ChatContainer} from '../../components/pages/ChatContainer';
import type {ChatStatus, TChatMessage} from '../../types';

import {PREVIEW_CLASS} from './theme';

export type PreviewScenario = 'welcome' | 'conversation' | 'streaming' | 'error';

const PREVIEW_STATUS: Record<PreviewScenario, ChatStatus> = {
    welcome: 'ready',
    conversation: 'ready',
    streaming: 'streaming',
    error: 'error',
};

const MESSAGES: TChatMessage[] = [
    {id: 'theme-user', role: 'user', content: 'How can I make this space feel like my product?'},
    {
        id: 'theme-assistant',
        role: 'assistant',
        content:
            'Start with your **brand colors**, then fine-tune the details.\n\n- Typography gives your chat its voice.\n- Rounded corners make it feel familiar.\n- Semantic colors keep feedback clear.\n\nExplore the [Gravity UI design system](https://gravity-ui.com/).\n\n```ts\nconst theme = {light: "#8b5cf6", dark: "#a78bfa"};\n```',
    },
];

export function ThemePreview({
    variant,
    scenario,
    mobile,
}: {
    variant: Theme;
    scenario: PreviewScenario;
    mobile: boolean;
}) {
    const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
    const [messages, setMessages] = useState<TChatMessage[]>(
        scenario === 'welcome' ? [] : MESSAGES,
    );
    const [status, setStatus] = useState<ChatStatus>(PREVIEW_STATUS[scenario]);
    return (
        <ThemeProvider theme={variant} scoped rootClassName={PREVIEW_CLASS}>
            <div className="aikit-themer__chat-frame" ref={setPortalContainer}>
                {portalContainer && (
                    <PortalProvider container={{current: portalContainer}}>
                        <ChatContainer
                            messages={messages}
                            status={status}
                            messageListConfig={{
                                loaderStatuses: ['streaming'],
                                loaderMessage: 'Shaping your next idea…',
                                withLoaderShimmer: true,
                            }}
                            isMobile={mobile}
                            showMascot
                            showNewChat
                            showHistory
                            showClose={false}
                            showFolding={false}
                            chats={[
                                {
                                    id: 'theme-chat',
                                    name: 'A fresh perspective',
                                    createTime: '2026-01-01T12:00:00Z',
                                },
                            ]}
                            onSelectChat={() => setMessages(MESSAGES)}
                            onCreateChat={() => setMessages([])}
                            onSendMessage={async ({content}) => {
                                setMessages((previous) => [
                                    ...previous,
                                    {id: `user-${previous.length}`, role: 'user', content},
                                    {
                                        id: `assistant-${previous.length}`,
                                        role: 'assistant',
                                        content:
                                            'Let’s turn that into a clear plan. Start with the outcome, identify the next step, and keep the details easy to follow.',
                                    },
                                ]);
                            }}
                            onRetry={() => setStatus('ready')}
                            onCancel={async () => setStatus('ready')}
                            welcomeConfig={{
                                title: 'A space for your next idea',
                                description:
                                    'Your assistant, in your colors. Make it feel at home.',
                                suggestions: [
                                    {id: 'ideas', title: 'Explore a new idea'},
                                    {id: 'plan', title: 'Make a plan'},
                                    {id: 'write', title: 'Help me write'},
                                ],
                            }}
                            headerProps={{title: 'Your assistant'}}
                            texts={{
                                promptPlaceholder: 'Ask anything…',
                            }}
                        />
                    </PortalProvider>
                )}
            </div>
        </ThemeProvider>
    );
}
