import {useState} from 'react';

import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {SubmitButton, SubmitButtonProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
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
        <ContentWrapper>
            <Showcase>
                <Story />
            </Showcase>
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

// Mock function for demonstration
const mockOnClick = async () => {
    // eslint-disable-next-line no-console
    console.log('Button clicked');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // eslint-disable-next-line no-console
    console.log('Action completed');
};

export const Playground: StoryFn<SubmitButtonProps> = (args) => {
    return (
        <ContentWrapper>
            <SubmitButton {...args} onClick={mockOnClick} />
        </ContentWrapper>
    );
};
Playground.args = {
    size: 'm',
    state: 'enabled',
};

export const Enabled: StoryFn<SubmitButtonProps> = () => {
    return (
        <ContentWrapper>
            <SubmitButton onClick={mockOnClick} state="enabled" />
        </ContentWrapper>
    );
};

export const Disabled: StoryFn<SubmitButtonProps> = () => {
    return (
        <ContentWrapper>
            <SubmitButton onClick={mockOnClick} state="disabled" />
        </ContentWrapper>
    );
};

export const Loading: StoryFn<SubmitButtonProps> = () => {
    return (
        <ContentWrapper>
            <SubmitButton onClick={mockOnClick} state="loading" />
        </ContentWrapper>
    );
};

export const Cancelable: StoryFn<SubmitButtonProps> = () => {
    return (
        <ContentWrapper>
            <SubmitButton onClick={mockOnClick} state="cancelable" />
        </ContentWrapper>
    );
};

export const Size: StoryObj<SubmitButtonProps> = {
    render: (args) => {
        return (
            <>
                <ShowcaseItem title="Size s">
                    <SubmitButton {...args} onClick={mockOnClick} size="s" />
                </ShowcaseItem>
                <ShowcaseItem title="Size m">
                    <SubmitButton {...args} onClick={mockOnClick} size="m" />
                </ShowcaseItem>
                <ShowcaseItem title="Size l">
                    <SubmitButton {...args} onClick={mockOnClick} size="l" />
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
                    <SubmitButton onClick={mockOnClick} state="enabled" />
                </ShowcaseItem>
                <ShowcaseItem title="Disabled">
                    <SubmitButton onClick={mockOnClick} state="disabled" />
                </ShowcaseItem>
                <ShowcaseItem title="Loading">
                    <SubmitButton onClick={mockOnClick} state="loading" />
                </ShowcaseItem>
                <ShowcaseItem title="Cancelable">
                    <SubmitButton onClick={mockOnClick} state="cancelable" />
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

    const handleClick = async () => {
        if (state === 'enabled') {
            setState('loading');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setState('cancelable');
        } else if (state === 'cancelable') {
            // eslint-disable-next-line no-console
            console.log('Cancelled');
            setState('enabled');
        }
    };

    return (
        <ContentWrapper>
            <Showcase>
                <ShowcaseItem title="Click the button to see loading and cancelable states">
                    <SubmitButton {...args} onClick={handleClick} state={state} />
                </ShowcaseItem>
            </Showcase>
        </ContentWrapper>
    );
};
