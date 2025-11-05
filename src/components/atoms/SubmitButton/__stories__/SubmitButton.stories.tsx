import {useState} from 'react';

import {Meta, StoryFn, StoryObj} from '@storybook/react';

import {SubmitButton, SubmitButtonProps} from '..';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/SubmitButton',
    component: SubmitButton,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        size: {
            control: 'radio',
            options: ['s', 'm', 'l'],
            description: 'Button size',
        },
        state: {
            control: 'radio',
            options: ['enabled', 'disabled', 'loading', 'cancelable'],
            description: 'Button state',
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

type Story = StoryObj<typeof SubmitButton>;

const defaultDecorators = [
    (Story: StoryFn) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

// Mock functions for demonstration
const mockOnSend = async () => {
    // eslint-disable-next-line no-console
    console.log('Start sending');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // eslint-disable-next-line no-console
    console.log('End sending');
};

const mockOnCancel = async () => {
    // eslint-disable-next-line no-console
    console.log('Cancelled');
};

export const Playground: StoryFn<SubmitButtonProps> = (args) => {
    return <SubmitButton {...args} onSend={mockOnSend} onCancel={mockOnCancel} />;
};
Playground.args = {
    size: 'm',
    state: 'enabled',
};

export const Enabled: StoryFn<SubmitButtonProps> = () => {
    return <SubmitButton onSend={mockOnSend} onCancel={mockOnCancel} state="enabled" />;
};

export const Disabled: StoryFn<SubmitButtonProps> = () => {
    return <SubmitButton onSend={mockOnSend} onCancel={mockOnCancel} state="disabled" />;
};

export const Loading: StoryFn<SubmitButtonProps> = () => {
    return <SubmitButton onSend={mockOnSend} onCancel={mockOnCancel} state="loading" />;
};

export const Cancelable: StoryFn<SubmitButtonProps> = () => {
    return <SubmitButton onSend={mockOnSend} onCancel={mockOnCancel} state="cancelable" />;
};

export const Size: StoryObj<SubmitButtonProps> = {
    render: (args) => {
        return (
            <>
                <ShowcaseItem title="Size s">
                    <SubmitButton {...args} onSend={mockOnSend} onCancel={mockOnCancel} size="s" />
                </ShowcaseItem>
                <ShowcaseItem title="Size m">
                    <SubmitButton {...args} onSend={mockOnSend} onCancel={mockOnCancel} size="m" />
                </ShowcaseItem>
                <ShowcaseItem title="Size l">
                    <SubmitButton {...args} onSend={mockOnSend} onCancel={mockOnCancel} size="l" />
                </ShowcaseItem>
            </>
        );
    },
    decorators: defaultDecorators,
};

export const States: StoryObj<SubmitButtonProps> = {
    render: () => {
        return (
            <>
                <ShowcaseItem title="Enabled">
                    <SubmitButton onSend={mockOnSend} onCancel={mockOnCancel} state="enabled" />
                </ShowcaseItem>
                <ShowcaseItem title="Disabled">
                    <SubmitButton onSend={mockOnSend} onCancel={mockOnCancel} state="disabled" />
                </ShowcaseItem>
                <ShowcaseItem title="Loading">
                    <SubmitButton onSend={mockOnSend} onCancel={mockOnCancel} state="loading" />
                </ShowcaseItem>
                <ShowcaseItem title="Cancelable">
                    <SubmitButton onSend={mockOnSend} onCancel={mockOnCancel} state="cancelable" />
                </ShowcaseItem>
            </>
        );
    },
    decorators: defaultDecorators,
};

// Interactive story to demonstrate loading and cancelable states
export const Interactive: StoryFn<SubmitButtonProps> = (args) => {
    const [state, setState] = useState<'enabled' | 'disabled' | 'loading' | 'cancelable'>(
        'enabled',
    );

    const handleSend = async () => {
        setState('loading');
        await mockOnSend();
        setState('cancelable');
    };

    const handleCancel = async () => {
        await mockOnCancel();
        setState('enabled');
    };

    return (
        <Showcase>
            <ShowcaseItem title="Click the button to see loading and cancelable states">
                <SubmitButton {...args} onSend={handleSend} onCancel={handleCancel} state={state} />
            </ShowcaseItem>
        </Showcase>
    );
};
