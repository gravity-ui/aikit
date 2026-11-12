import {useRef, useState} from 'react';

import {Button, Flex, Switch} from '@gravity-ui/uikit';

import {ChatContainer} from '../..';
import {StoryPlayground} from '../../../../../demo/StoryPlayground/StoryPlayground';
import type {TChatMessage} from '../../../../../types';
import {
    UserInstructionsScreen,
    type UserInstructionsScreenState,
} from '../../../../templates/UserInstructionsScreen';
import type {ChatScreenDefinition} from '../../screenTypes';

import type {Story} from './shared';

export const ScreenNavigation: Story = {
    decorators: [],
    args: {
        showHistory: false,
        texts: {emptyStateTitle: 'Welcome', promptPlaceholder: 'Write a message'},
    },
    render: (args) => {
        const [activeScreen, setActiveScreen] = useState('chat');
        const [instructions, setInstructions] = useState('');
        const formState = useRef<UserInstructionsScreenState>({dirty: false, saving: false});
        const [failNextSave, setFailNextSave] = useState(false);
        const [messages, setMessages] = useState<TChatMessage[]>(args.messages ?? []);
        const [enabled, setEnabled] = useState(true);
        const [confirmLeave, setConfirmLeave] = useState(false);
        const resolveLeave = useRef<(allowed: boolean) => void>();
        const screens: ChatScreenDefinition[] = [
            {
                id: 'instructions',
                title: 'User instructions',
                enabled,
                menu: {label: 'User instructions'},
                beforeLeave: () => {
                    if (formState.current.saving) {
                        return false;
                    }
                    if (!formState.current.dirty) {
                        return true;
                    }
                    setConfirmLeave(true);
                    return new Promise<boolean>((resolve) => {
                        resolveLeave.current = resolve;
                    });
                },
                render: ({pending}) => (
                    <UserInstructionsScreen
                        value={instructions}
                        maxLength={2000}
                        disabled={pending}
                        texts={{placeholder: 'How should the assistant respond?'}}
                        onStateChange={(state) => {
                            formState.current = state;
                        }}
                        onSave={async (next) => {
                            await new Promise((resolve) => setTimeout(resolve, 300));
                            if (failNextSave) {
                                setFailNextSave(false);
                                throw new Error('Example persistence failure');
                            }
                            setInstructions(next);
                        }}
                        onSaved={() => setActiveScreen('chat')}
                        onCancel={() => setActiveScreen('chat')}
                    />
                ),
                footer: () =>
                    confirmLeave && (
                        <Flex gap="2">
                            <Button
                                onClick={() => {
                                    setConfirmLeave(false);
                                    resolveLeave.current?.(false);
                                }}
                            >
                                Keep editing
                            </Button>
                            <Button
                                onClick={() => {
                                    setConfirmLeave(false);
                                    resolveLeave.current?.(true);
                                }}
                            >
                                Discard changes
                            </Button>
                        </Flex>
                    ),
            },
        ];
        return (
            <StoryPlayground
                mobile={args.isMobile}
                controls={
                    <>
                        <Switch checked={enabled} onUpdate={setEnabled}>
                            Instructions available
                        </Switch>
                        <Switch checked={failNextSave} onUpdate={setFailNextSave}>
                            Fail next save
                        </Switch>
                        {args.status === 'streaming' && (
                            <Button
                                onClick={() =>
                                    setMessages((previous) => [
                                        ...previous,
                                        {
                                            id: `response-${previous.length}`,
                                            role: 'assistant',
                                            content:
                                                'A response arrived while you were reading. '.repeat(
                                                    12,
                                                ),
                                        },
                                    ])
                                }
                            >
                                Receive response chunk
                            </Button>
                        )}
                        {args.status === 'streaming' && (
                            <Button
                                onClick={() =>
                                    setMessages((previous) => [
                                        ...Array.from(
                                            {length: 50},
                                            (_, index): TChatMessage => ({
                                                id: `older-${previous.length}-${index}`,
                                                role: 'user',
                                                content: `Earlier message ${index}`,
                                            }),
                                        ),
                                        ...previous,
                                    ])
                                }
                            >
                                Receive older messages
                            </Button>
                        )}
                    </>
                }
            >
                <ChatContainer
                    {...args}
                    screens={screens}
                    activeScreen={activeScreen}
                    onScreenChange={(next) => {
                        formState.current = {dirty: false, saving: false};
                        resolveLeave.current?.(false);
                        setConfirmLeave(false);
                        setActiveScreen(next);
                    }}
                    messages={messages}
                    onSendMessage={async ({content}) => {
                        setMessages((previous) => [
                            ...previous,
                            {id: String(previous.length), role: 'user', content},
                        ]);
                    }}
                />
            </StoryPlayground>
        );
    },
};

export const MobileScreenNavigation: Story = {
    ...ScreenNavigation,
    decorators: [],
    args: {...ScreenNavigation.args, isMobile: true, floatingHeader: true},
};

const longConversation: TChatMessage[] = Array.from({length: 35}, (_, index) => ({
    id: `message-${index}`,
    role: index % 2 === 0 ? 'user' : 'assistant',
    content: `Message ${index}: ${'Content to read while the assistant works. '.repeat(8)}`,
}));

export const StreamingScreenNavigation: Story = {
    ...ScreenNavigation,
    args: {...ScreenNavigation.args, messages: longConversation, status: 'streaming'},
};

export const VirtualizedScreenNavigation: Story = {
    ...StreamingScreenNavigation,
    args: {...StreamingScreenNavigation.args, messageListConfig: {virtualized: true}},
};
