import {useState} from 'react';

import {ChatContainer} from '../..';
import {TestMascot} from '../../../../../demo/TestMascot';
import type {ChatStatus, TChatMessage, TSubmitData} from '../../../../../types';

import {type Story, defaultDecorators} from './shared';

const createAnimatedMascot = (state: string, view: 'hero' | 'chat') => (
    <TestMascot state={state} size={view === 'hero' ? '8rem' : '4rem'} animated />
);

const chatMascots = {
    reveal: createAnimatedMascot('reveal', 'chat'),
    thinking: createAnimatedMascot('thinking', 'chat'),
    done: createAnimatedMascot('done', 'chat'),
    idle: createAnimatedMascot('idle', 'chat'),
    reading: createAnimatedMascot('reading', 'chat'),
    error: createAnimatedMascot('error', 'chat'),
    stopped: createAnimatedMascot('stopped', 'chat'),
    sleeping: createAnimatedMascot('sleeping', 'chat'),
    listening: createAnimatedMascot('listening', 'chat'),
    speaking: createAnimatedMascot('speaking', 'chat'),
};

export const WithMascot: Story = {
    args: {
        welcomeConfig: {title: 'Mascot support', description: 'Type to see reading'},
        mascotConfig: {
            sleepDelayMs: 5_000,
            onceDurations: {done: 2_000},
            mascots: {
                hero: {
                    idle: createAnimatedMascot('idle', 'hero'),
                    reading: createAnimatedMascot('reading', 'hero'),
                },
                chat: chatMascots,
            },
        },
    },
    decorators: defaultDecorators,
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>([]);
        const [status, setStatus] = useState<ChatStatus>('ready');
        const handleSend = async ({content}: TSubmitData) => {
            setMessages((current) => [
                ...current,
                {id: `user-${Date.now()}`, role: 'user', content},
            ]);
            setStatus('submitted');
            await new Promise((resolve) => setTimeout(resolve, 400));
            setMessages((current) => [
                ...current,
                {id: `assistant-${Date.now()}`, role: 'assistant', content: 'Mascot state demo'},
            ]);
            setStatus('ready');
        };
        return (
            <ChatContainer
                {...args}
                messages={messages}
                status={status}
                onSendMessage={handleSend}
                onCancel={async () => setStatus('ready')}
            />
        );
    },
};
