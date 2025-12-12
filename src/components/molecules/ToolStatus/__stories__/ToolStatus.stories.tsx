import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ToolStatus} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import type {ToolStatusProps} from '../index';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/ToolStatus',
    component: ToolStatus,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        status: {
            control: 'select',
            options: ['success', 'error', 'loading', 'cancelled', undefined],
            description: 'Tool status',
        },
    },
} as Meta;

type Story = StoryObj<typeof ToolStatus>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

export const Playground: StoryFn<ToolStatusProps> = (args) => (
    <ContentWrapper width="430px">
        <ToolStatus {...args} />
    </ContentWrapper>
);
Playground.args = {
    status: 'success',
};

export const Success: StoryObj<ToolStatusProps> = {
    render: (args) => (
        <ContentWrapper width="430px">
            <ToolStatus {...args} status="success" />
        </ContentWrapper>
    ),
    decorators: defaultDecorators,
};

export const Error: StoryObj<ToolStatusProps> = {
    render: (args) => (
        <ContentWrapper width="430px">
            <ToolStatus {...args} status="error" />
        </ContentWrapper>
    ),
    decorators: defaultDecorators,
};

export const Loading: StoryObj<ToolStatusProps> = {
    render: (args) => (
        <ContentWrapper width="430px">
            <ToolStatus {...args} status="loading" />
        </ContentWrapper>
    ),
    decorators: defaultDecorators,
};

export const Cancelled: StoryObj<ToolStatusProps> = {
    render: (args) => (
        <ContentWrapper width="430px">
            <ToolStatus {...args} status="cancelled" />
        </ContentWrapper>
    ),
    decorators: defaultDecorators,
};
