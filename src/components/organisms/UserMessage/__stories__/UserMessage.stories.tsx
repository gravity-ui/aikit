import {Meta, StoryFn} from '@storybook/react-webpack5';

import {UserMessage, type UserMessageProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/UserMessage',
    component: UserMessage,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        data: {
            control: 'text',
            description: 'Message text',
        },
        actions: {
            control: 'object',
            description: 'Actions',
        },
        showActionsOnHover: {
            control: 'boolean',
            description: 'Show actions on hover',
        },
        showTimestamp: {
            control: 'boolean',
            description: 'Show timestamp',
        },
        timestamp: {
            control: 'text',
            description: 'Timestamp',
        },
        withAvatar: {
            control: 'boolean',
            description: 'Show avatar',
        },
        avatarUrl: {
            control: 'text',
            description: 'Avatar URL',
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

const buttons = [
    {type: 'copy', onClick: () => ({})},
    {type: 'edit', onClick: () => ({})},
];

export const Playground: StoryFn<UserMessageProps> = (args) => (
    <ContentWrapper>
        <UserMessage {...args} />
    </ContentWrapper>
);
Playground.args = {
    content: 'Analyze the project and suggest a better solution to implement a feature-name',
    actions: buttons,
};

export const ShowAvatar: StoryFn<UserMessageProps> = (args) => (
    <ContentWrapper>
        <UserMessage {...args} showAvatar={true} />
    </ContentWrapper>
);
ShowAvatar.args = {
    content: 'Analyze the project and suggest a better solution to implement a feature-name',
    actions: buttons,
};

export const ShowTimestamp: StoryFn<UserMessageProps> = (args) => (
    <ContentWrapper>
        <UserMessage {...args} showTimestamp={true} timestamp="1705312234567" />
    </ContentWrapper>
);
ShowTimestamp.args = {
    content: 'Analyze the project and suggest a better solution to implement a feature-name',
    actions: buttons,
};
