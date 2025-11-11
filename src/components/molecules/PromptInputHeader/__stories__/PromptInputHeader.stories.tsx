import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {PromptInputHeader} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {SwapArea} from '../../../../demo/SwapArea/SwapArea';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/PromptInputHeader',
    component: PromptInputHeader,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof PromptInputHeader>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="450px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    args: {},
    decorators: defaultDecorators,
};

export const WithContextIndicator: Story = {
    args: {
        showContextIndicator: true,
        contextIndicatorProps: {
            type: 'percent',
            usedContext: 24,
        },
    },
    decorators: defaultDecorators,
};

export const WithContextIndicatorNumber: Story = {
    args: {
        showContextIndicator: true,
        contextIndicatorProps: {
            type: 'number',
            usedContext: 2400,
            maxContext: 10000,
        },
    },
    decorators: defaultDecorators,
};

export const WithCustomContent: Story = {
    args: {
        children: <SwapArea />,
    },
    decorators: defaultDecorators,
};
