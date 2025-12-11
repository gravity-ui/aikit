import {Button} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {BaseMessage} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import type {BaseMessageProps} from '../../../../types/messages';

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
    role: 'assistant',
};

export const Variant: StoryObj<BaseMessageProps> = {
    render: (args) => (
        <>
            <ShowcaseItem title="User" width="300px">
                <BaseMessage {...args} actions={buttons} role="user">
                    {'My message'}
                </BaseMessage>
            </ShowcaseItem>
            <ShowcaseItem title="Assistant" width="300px">
                <BaseMessage {...args} actions={buttons} role="assistant">
                    {'My message'}
                </BaseMessage>
            </ShowcaseItem>
            <ShowcaseItem title="System" width="300px">
                <BaseMessage {...args} actions={buttons} role="system">
                    {'My message'}
                </BaseMessage>
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};
export const ShowActionsOnHover: StoryFn<BaseMessageProps> = (args) => (
    <ContentWrapper>
        <BaseMessage {...args} actions={buttons} role="assistant" showActionsOnHover={true}>
            {'My message'}
        </BaseMessage>
    </ContentWrapper>
);

export const ShowTimestamp: StoryObj<BaseMessageProps> = {
    render: (args) => (
        <>
            <ShowcaseItem title="User" width="350px">
                <BaseMessage
                    {...args}
                    actions={buttons}
                    role="user"
                    showTimestamp={true}
                    timestamp="1705312234567"
                >
                    {'My message'}
                </BaseMessage>
            </ShowcaseItem>
            <ShowcaseItem title="Assistant" width="350px">
                <BaseMessage
                    {...args}
                    actions={buttons}
                    role="assistant"
                    showTimestamp={true}
                    timestamp="1705312234567"
                >
                    {'My message'}
                </BaseMessage>
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};

export const WithCustomAction: StoryFn<BaseMessageProps> = (args) => (
    <ContentWrapper>
        <BaseMessage
            {...args}
            actions={[
                // eslint-disable-next-line no-console
                {type: 'copy', onClick: () => console.log('copy')},
                // eslint-disable-next-line no-console
                {type: 'edit', onClick: () => console.log('edit')},
                // Custom ReactNode action
                <Button
                    key="custom"
                    view="outlined-info"
                    size="s"
                    // eslint-disable-next-line no-console
                    onClick={() => console.log('custom')}
                >
                    Custom
                </Button>,
            ]}
            role="assistant"
        >
            {'Message with custom action button'}
        </BaseMessage>
    </ContentWrapper>
);
