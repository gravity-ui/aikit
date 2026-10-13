import {type CSSProperties, useState} from 'react';

import type {StoryObj} from '@storybook/react-webpack5';

import {ChatContainer, type ChatContainerProps} from '../..';
import type {ChatStatus, TChatMessage, TSubmitData} from '../../../../../types';

import {type Story, createMessageId, defaultDecorators} from './shared';

function MascotChat(args: ChatContainerProps) {
    const [messages, setMessages] = useState<TChatMessage[]>([]);
    const [status, setStatus] = useState<ChatStatus>('ready');
    const handleSend = async ({content}: TSubmitData) => {
        setMessages((current) => [
            ...current,
            {id: createMessageId('user'), role: 'user', content},
        ]);
        setStatus('submitted');
        await new Promise((resolve) => setTimeout(resolve, 400));
        setMessages((current) => [
            ...current,
            {id: createMessageId('assistant'), role: 'assistant', content: 'Mascot state demo'},
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
}

export const WithMascot: Story = {
    args: {
        welcomeConfig: {title: 'Mascot support', description: 'Type to see reading'},
        showMascot: true,
    },
    decorators: defaultDecorators,
    render: (args) => <MascotChat {...args} />,
};

type MascotColorArgs = {
    bodyCenterColor: string;
    bodyEdgeColor: string;
    eyeColor: string;
    pupilColor: string;
};

export const MascotColors: StoryObj<ChatContainerProps & MascotColorArgs> = {
    args: {
        ...WithMascot.args,
        welcomeConfig: {
            title: 'Customize mascot colors',
            description: 'Change the color controls, then send a message to see the chat mascot.',
        },
        bodyCenterColor: '#b24dff',
        bodyEdgeColor: '#4cb2ff',
        eyeColor: '#ffffff',
        pupilColor: '#171717',
    },
    argTypes: {
        bodyCenterColor: {
            name: '--g-aikit-mascot-body-center-color',
            control: 'color',
            description: 'Center color of the body gradient.',
            table: {category: 'Mascot colors'},
        },
        bodyEdgeColor: {
            name: '--g-aikit-mascot-body-edge-color',
            control: 'color',
            description: 'Edge color of the body gradient.',
            table: {category: 'Mascot colors'},
        },
        eyeColor: {
            name: '--g-aikit-mascot-eye-color',
            control: 'color',
            description: 'Eye color.',
            table: {category: 'Mascot colors'},
        },
        pupilColor: {
            name: '--g-aikit-mascot-pupil-color',
            control: 'color',
            description: 'Pupil and listening ring color.',
            table: {category: 'Mascot colors'},
        },
    },
    decorators: defaultDecorators,
    render: ({bodyCenterColor, bodyEdgeColor, eyeColor, pupilColor, ...args}) => {
        const style = {
            height: '100%',
            '--g-aikit-mascot-body-center-color': bodyCenterColor,
            '--g-aikit-mascot-body-edge-color': bodyEdgeColor,
            '--g-aikit-mascot-eye-color': eyeColor,
            '--g-aikit-mascot-pupil-color': pupilColor,
        } as CSSProperties;
        return (
            <div style={style}>
                <MascotChat {...args} />
            </div>
        );
    },
};
