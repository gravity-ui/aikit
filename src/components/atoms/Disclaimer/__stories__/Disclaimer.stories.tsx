import {Meta, StoryFn} from '@storybook/react-webpack5';

import {Disclaimer, DisclaimerProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

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

export const Playground: StoryFn<DisclaimerProps> = (args) => (
    <ContentWrapper>
        <Disclaimer {...args} />
    </ContentWrapper>
);
Playground.args = {text: 'This is a disclaimer text'};

export const WithText: StoryFn<DisclaimerProps> = (args) => (
    <ContentWrapper>
        <Disclaimer {...args} text="This is an important disclaimer message" />
    </ContentWrapper>
);

export const WithChildren: StoryFn<DisclaimerProps> = (args) => (
    <ContentWrapper>
        <Disclaimer {...args}>
            <span>Custom content goes here</span>
        </Disclaimer>
    </ContentWrapper>
);

export const WithTextAndChildren: StoryFn<DisclaimerProps> = (args) => (
    <ContentWrapper>
        <Disclaimer {...args} text="Disclaimer text">
            <span>Additional content</span>
        </Disclaimer>
    </ContentWrapper>
);
