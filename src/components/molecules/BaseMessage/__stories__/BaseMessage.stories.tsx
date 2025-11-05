import {Meta, StoryFn, StoryObj} from '@storybook/react';

import {BaseMessage, type BaseMessageProps} from '..';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/BaseMessage',
    component: BaseMessage,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        variant: {
            control: 'radio',
            options: ['user', 'assistant', 'system'],
            description: 'Type of message',
        },
        showActionsOnHover: {
            control: 'boolean',
            description: 'Show actions on hover',
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

type Story = StoryObj<typeof BaseMessage>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

const buttons = [
    {type: 'copy', onClick: () => console.log('copy')},
    {type: 'edit', onClick: () => console.log('edit')},
    {type: 'delete', onClick: () => console.log('delete')},
    {type: 'custom', onClick: () => console.log('custom')},
    {type: 'like', onClick: () => console.log('like')},
    {type: 'unlike', onClick: () => console.log('unlike')},
];

export const Playground: StoryFn<BaseMessageProps> = (args) => <BaseMessage {...args} />;
Playground.args = {
    children: 'My message',
    actions: buttons,
    variant: 'assistant',
};

export const Variant: StoryObj<BaseMessageProps> = {
    render: (args) => (
        <>
            <ShowcaseItem title="User">
                <BaseMessage {...args} actions={buttons} variant="user">
                    {'My message'}
                </BaseMessage>
            </ShowcaseItem>
            <ShowcaseItem title="Assistant">
                <BaseMessage {...args} actions={buttons} variant="assistant">
                    {'My message'}
                </BaseMessage>
            </ShowcaseItem>
            <ShowcaseItem title="System">
                <BaseMessage {...args} actions={buttons} variant="system">
                    {'My message'}
                </BaseMessage>
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};
export const ShowActionsOnHover: StoryFn<BaseMessageProps> = (args) => (
    <BaseMessage {...args} actions={buttons} variant="assistant" showActionsOnHover={true}>
        {'My message'}
    </BaseMessage>
);
