import {useEffect, useRef, useState} from 'react';

import {Button, Flex, Switch, Text} from '@gravity-ui/uikit';

import {ChatContainer} from '../..';
import {StoryPlayground} from '../../../../../demo/StoryPlayground/StoryPlayground';
import type {TChatMessage} from '../../../../../types';
import {AttachmentPicker} from '../../../../organisms/AttachmentPicker';
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
                                        ...previous.map((message) => ({...message})),
                                        {role: 'assistant', content: 'A newly appended response'},
                                    ])
                                }
                            >
                                Rebuild messages and append
                            </Button>
                        )}
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

export const AnonymousScreenNavigation: Story = {
    ...StreamingScreenNavigation,
    args: {
        ...StreamingScreenNavigation.args,
        messages: longConversation.map(({id: _id, ...message}) => message),
    },
};
export const AnonymousVirtualizedScreenNavigation: Story = {
    ...AnonymousScreenNavigation,
    args: {...AnonymousScreenNavigation.args, messageListConfig: {virtualized: true}},
};

function ReviewScenariosExample(args: React.ComponentProps<typeof ChatContainer>) {
    const [activeScreen, setActiveScreen] = useState('chat');
    const [value, setValue] = useState('');
    const [normalize, setNormalize] = useState(true);
    const [stayOpen, setStayOpen] = useState(true);
    const [scheduled, setScheduled] = useState(false);
    const [closeCount, setCloseCount] = useState(0);
    const [files, setFiles] = useState([{id: 'queued', name: 'queued.txt'}]);
    useEffect(() => {
        if (!scheduled) {
            return undefined;
        }
        const timer = setTimeout(() => {
            setActiveScreen('instructions');
            setScheduled(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, [scheduled]);
    return (
        <StoryPlayground
            controls={
                <>
                    <Button onClick={() => setActiveScreen('instructions')}>
                        Open instructions
                    </Button>
                    <Button disabled={scheduled} onClick={() => setScheduled(true)}>
                        {scheduled ? 'Navigation scheduled…' : 'Open instructions in 5 seconds'}
                    </Button>
                    <Switch checked={normalize} onUpdate={setNormalize}>
                        Trim saved value
                    </Switch>
                    <Switch checked={stayOpen} onUpdate={setStayOpen}>
                        Stay on instructions after Save
                    </Switch>
                    <Text>Saved value: {JSON.stringify(value)}</Text>
                    <Text>Close requests: {closeCount}</Text>
                </>
            }
        >
            <ChatContainer
                {...args}
                activeScreen={activeScreen}
                onScreenChange={setActiveScreen}
                onClose={() => setCloseCount((count) => count + 1)}
                promptInputProps={{
                    footerProps: {
                        attachmentContent: (
                            <AttachmentPicker
                                uploadLabel="Attach files"
                                fileDialogProps={{
                                    title: 'Attach files',
                                    files,
                                    onAdd: (added) =>
                                        setFiles((previous) => [
                                            ...previous,
                                            ...added.map((file, index) => ({
                                                id: `${previous.length}-${index}`,
                                                name: file.name,
                                            })),
                                        ]),
                                    onCancel: () => setFiles([]),
                                }}
                            />
                        ),
                    },
                }}
                screens={[
                    {
                        id: 'instructions',
                        title: 'User instructions',
                        menu: {label: 'User instructions'},
                        render: () => (
                            <UserInstructionsScreen
                                value={value}
                                maxLength={2000}
                                onSave={async (next) => {
                                    setValue(normalize ? next.trim() : next);
                                    await new Promise((resolve) => setTimeout(resolve, 500));
                                }}
                                onSaved={() => {
                                    if (!stayOpen) {
                                        setActiveScreen('chat');
                                    }
                                }}
                                onCancel={() => setActiveScreen('chat')}
                            />
                        ),
                    },
                ]}
            />
        </StoryPlayground>
    );
}

export const ReviewScenarios: Story = {
    decorators: [],
    args: {...ScreenNavigation.args, showClose: true, onSendMessage: async () => {}},
    render: (args) => <ReviewScenariosExample {...args} />,
};
