import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {BaseMessage, type BaseMessageProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
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
        <ContentWrapper>
            <Showcase>
                <Story />
            </Showcase>
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

const buttons = [
    // eslint-disable-next-line no-console
    {type: 'copy', onClick: () => console.log('copy')},
    // eslint-disable-next-line no-console
    {type: 'edit', onClick: () => console.log('edit')},
    // eslint-disable-next-line no-console
    {type: 'delete', onClick: () => console.log('delete')},
    // eslint-disable-next-line no-console
    {type: 'custom', onClick: () => console.log('custom')},
    // eslint-disable-next-line no-console
    {type: 'like', onClick: () => console.log('like')},
    // eslint-disable-next-line no-console
    {type: 'unlike', onClick: () => console.log('unlike')},
];

export const Playground: StoryFn<BaseMessageProps> = (args) => (
    <ContentWrapper>
        <BaseMessage {...args} />
    </ContentWrapper>
);
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
    <ContentWrapper>
        <BaseMessage {...args} actions={buttons} variant="assistant" showActionsOnHover={true}>
            {'My message'}
        </BaseMessage>
    </ContentWrapper>
);
