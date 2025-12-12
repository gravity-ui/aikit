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
        variant: {
            control: 'select',
            options: [
                'body-1',
                'body-2',
                'body-3',
                'body-short',
                'caption-1',
                'caption-2',
                'subheader-1',
                'subheader-2',
                'subheader-3',
                'header-1',
                'header-2',
                'display-1',
                'display-2',
                'display-3',
                'display-4',
                'code-1',
                'code-2',
                'code-3',
                'code-inline-1',
                'code-inline-2',
                'code-inline-3',
                'inherit',
            ],
            description: 'Text variant for typography styling',
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

export const WithCaptionVariant: StoryFn<DisclaimerProps> = (args) => (
    <ContentWrapper>
        <Disclaimer {...args} text="Small disclaimer with caption-2 variant" variant="caption-2" />
    </ContentWrapper>
);

export const WithBody2Variant: StoryFn<DisclaimerProps> = (args) => (
    <ContentWrapper>
        <Disclaimer {...args} text="Larger disclaimer with body-2 variant" variant="body-2" />
    </ContentWrapper>
);

export const WithSubheaderVariant: StoryFn<DisclaimerProps> = (args) => (
    <ContentWrapper>
        <Disclaimer
            {...args}
            text="Prominent disclaimer with subheader-1 variant"
            variant="subheader-1"
        />
    </ContentWrapper>
);

export const AllVariants: StoryFn<DisclaimerProps> = (args) => (
    <ContentWrapper>
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <Disclaimer {...args} text="caption-1: Smallest text" variant="caption-1" />
            <Disclaimer {...args} text="caption-2: Small text" variant="caption-2" />
            <Disclaimer {...args} text="body-1: Default body text" variant="body-1" />
            <Disclaimer {...args} text="body-2: Larger body text" variant="body-2" />
            <Disclaimer {...args} text="body-3: Large body text" variant="body-3" />
            <Disclaimer {...args} text="subheader-1: Subheader text" variant="subheader-1" />
            <Disclaimer {...args} text="subheader-2: Larger subheader" variant="subheader-2" />
            <Disclaimer {...args} text="header-1: Header text" variant="header-1" />
        </div>
    </ContentWrapper>
);
