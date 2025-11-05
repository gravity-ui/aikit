import {Meta, StoryFn} from '@storybook/react';

import {Disclaimer, DisclaimerProps} from '..';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/Disclaimer',
    component: Disclaimer,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        text: {
            control: 'text',
            description: 'Disclaimer text',
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

export const Playground: StoryFn<DisclaimerProps> = (args) => <Disclaimer {...args} />;
Playground.args = {text: 'This is a disclaimer text'};

export const WithText: StoryFn<DisclaimerProps> = (args) => (
    <Disclaimer {...args} text="This is an important disclaimer message" />
);

export const WithChildren: StoryFn<DisclaimerProps> = (args) => (
    <Disclaimer {...args}>
        <span>Custom content goes here</span>
    </Disclaimer>
);

export const WithTextAndChildren: StoryFn<DisclaimerProps> = (args) => (
    <Disclaimer {...args} text="Disclaimer text">
        <span>Additional content</span>
    </Disclaimer>
);
