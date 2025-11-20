import React, {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ContextItemConfig, PromptInputHeader} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {SwapArea} from '../../../../demo/SwapArea';

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

export const WithContextItems: Story = {
    render: (args) => {
        const [items, setItems] = useState<ContextItemConfig[]>([
            {id: '1', content: 'file.tsx', onRemove: () => {}},
            {id: '2', content: 'component.tsx', onRemove: () => {}},
            {id: '3', content: 'utils.ts', onRemove: () => {}},
        ]);

        const handleRemove = (id: string) => {
            setItems(items.filter((item) => item.id !== id));
        };

        return (
            <PromptInputHeader
                {...args}
                contextItems={items.map((item) => ({
                    ...item,
                    onRemove: () => handleRemove(item.id),
                }))}
            />
        );
    },
    decorators: defaultDecorators,
};

export const WithSingleContextItem: Story = {
    args: {
        contextItems: [
            {
                id: '1',
                content: 'README.md',
                onRemove: () => {
                    // Handle remove
                },
            },
        ],
    },
    decorators: defaultDecorators,
};

export const WithManyContextItems: Story = {
    args: {
        contextItems: [
            {id: '1', content: 'file1.tsx', onRemove: () => {}},
            {id: '2', content: 'file2.tsx', onRemove: () => {}},
            {id: '3', content: 'file3.tsx', onRemove: () => {}},
            {id: '4', content: 'file4.tsx', onRemove: () => {}},
            {id: '5', content: 'file5.tsx', onRemove: () => {}},
        ],
    },
    decorators: defaultDecorators,
};

export const WithContextItemsAndIndicator: Story = {
    args: {
        contextItems: [
            {id: '1', content: 'file.tsx', onRemove: () => {}},
            {id: '2', content: 'component.tsx', onRemove: () => {}},
        ],
        showContextIndicator: true,
        contextIndicatorProps: {
            type: 'percent',
            usedContext: 75,
        },
    },
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
