import {useRef, useState} from 'react';

import {Button, Flex, TextArea} from '@gravity-ui/uikit';

import {ChatContainer} from '../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import type {TChatMessage} from '../../../../../types';
import type {ChatScreenDefinition} from '../../screenTypes';

import {type Story, defaultDecorators} from './shared';

export const ScreenNavigation: Story = {
    decorators: defaultDecorators,
    args: {
        showHistory: false,
        texts: {emptyStateTitle: 'Welcome', promptPlaceholder: 'Write a message'},
    },
    render: (args) => {
        const [activeScreen, setActiveScreen] = useState('chat');
        const [instructions, setInstructions] = useState('');
        const [draft, setDraft] = useState('');
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
                    if (draft === instructions) {
                        return true;
                    }
                    setConfirmLeave(true);
                    return new Promise<boolean>((resolve) => {
                        resolveLeave.current = resolve;
                    });
                },
                render: () => (
                    <Flex direction="column" gap="3" style={{width: '100%'}}>
                        <TextArea
                            value={draft}
                            onUpdate={setDraft}
                            placeholder="How should the assistant respond?"
                        />
                        {confirmLeave && (
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
                        )}
                    </Flex>
                ),
                footer: ({pending}) => (
                    <Flex gap="2">
                        <Button
                            view="action"
                            disabled={pending}
                            onClick={() => {
                                setInstructions(draft);
                                setActiveScreen('chat');
                            }}
                        >
                            Save
                        </Button>
                        <Button
                            disabled={pending}
                            onClick={() => {
                                setDraft(instructions);
                                setActiveScreen('chat');
                            }}
                        >
                            Cancel
                        </Button>
                    </Flex>
                ),
            },
        ];
        return (
            <Flex direction="column" style={{height: '100%', width: '100%'}} gap="2">
                <Button onClick={() => setEnabled((value) => !value)}>
                    Toggle instructions availability
                </Button>
                {args.status === 'streaming' && (
                    <Button
                        onClick={() =>
                            setMessages((previous) => [
                                ...previous,
                                {
                                    id: `response-${previous.length}`,
                                    role: 'assistant',
                                    content: 'A response arrived while you were reading. '.repeat(
                                        12,
                                    ),
                                },
                            ])
                        }
                    >
                        Receive response chunk
                    </Button>
                )}
                <ChatContainer
                    {...args}
                    screens={screens}
                    activeScreen={activeScreen}
                    onScreenChange={(next) => {
                        setDraft(instructions);
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
            </Flex>
        );
    },
};

export const MobileScreenNavigation: Story = {
    ...ScreenNavigation,
    decorators: [
        (Story) => (
            <ContentWrapper height="760px" width="360px" maxWidth="100%" boxSizing="border-box">
                <Story />
            </ContentWrapper>
        ),
    ],
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
