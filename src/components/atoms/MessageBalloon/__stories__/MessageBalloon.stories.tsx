import {Meta, StoryFn} from '@storybook/react';

import {MessageBalloon, type MessageBalloonProps} from '..';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/MessageBalloon',
    component: MessageBalloon,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        children: {
            control: 'text',
            description: 'Content of message',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class',
        },
        qa: {
            control: 'text',
            description: 'QA/test identifier',
        },
    },
} as Meta;

export const Playground: StoryFn<MessageBalloonProps> = (args) => <MessageBalloon {...args} />;
Playground.args = {
    children: 'User question',
};

export const User = () => <MessageBalloon>User question</MessageBalloon>;
