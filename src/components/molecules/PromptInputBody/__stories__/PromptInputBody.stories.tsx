import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {PromptInputBody} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {SwapArea} from '../../../../demo/SwapArea/SwapArea';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/PromptInputBody',
    component: PromptInputBody,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof PromptInputBody>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="450px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    args: {
        placeholder: 'Plan, code, build and test anything',
    },
    decorators: defaultDecorators,
};

export const WithValue: Story = {
    render: (args) => {
        const [value, setValue] = useState('Hello, this is a test message!');
        return (
            <PromptInputBody
                {...args}
                value={value}
                onChange={setValue}
                placeholder="Plan, code, build and test anything"
            />
        );
    },
    decorators: defaultDecorators,
};

export const MultiLine: Story = {
    render: (args) => {
        const [value, setValue] = useState(
            'This is a multi-line\ntext input\nwith several lines\nof content',
        );
        return (
            <PromptInputBody
                {...args}
                value={value}
                onChange={setValue}
                placeholder="Plan, code, build and test anything"
                minRows={3}
                maxRows={10}
            />
        );
    },
    decorators: defaultDecorators,
};

export const WithMaxLength: Story = {
    render: (args) => {
        const [value, setValue] = useState('');
        return (
            <>
                <PromptInputBody
                    {...args}
                    value={value}
                    onChange={setValue}
                    placeholder="Maximum 100 characters"
                    maxLength={100}
                />
                <div
                    style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: 'var(--g-color-text-secondary)',
                    }}
                >
                    {value.length} / 100 characters
                </div>
            </>
        );
    },
    decorators: defaultDecorators,
};

export const WithCustomContent: Story = {
    args: {
        children: <SwapArea />,
    },
    decorators: defaultDecorators,
};

export const Disabled: Story = {
    render: (args) => {
        const [value, setValue] = useState('This input is disabled');
        return (
            <PromptInputBody
                {...args}
                value={value}
                onChange={setValue}
                placeholder="Plan, code, build and test anything"
                disabledInput={true}
            />
        );
    },
    decorators: defaultDecorators,
};
