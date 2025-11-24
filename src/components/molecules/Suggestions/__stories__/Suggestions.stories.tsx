import React from 'react';

import {Meta, StoryFn} from '@storybook/react-webpack5';

import {Suggestions, SuggestionsProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/Suggestions',
    component: Suggestions,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        items: {
            control: 'object',
            description: 'Array of suggestion items to display',
        },
        onClick: {
            action: 'clicked',
            description: 'Callback function called when a suggestion is clicked',
        },
        title: {
            control: 'text',
            description: 'Title to display above suggestions',
        },
        layout: {
            control: 'select',
            options: ['grid', 'list'],
            description: 'Layout orientation: grid for horizontal, list for vertical',
        },
        textAlign: {
            control: 'select',
            options: ['left', 'center', 'right'],
            description: 'Text alignment inside buttons',
        },
        wrapText: {
            control: 'boolean',
            description: 'Enable text wrapping inside buttons instead of ellipsis',
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

export const Playground: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions {...args} />
    </ContentWrapper>
);
Playground.args = {
    items: [
        {id: '1', title: 'First suggestion'},
        {id: '2', title: 'Second suggestion'},
        {id: '3', title: 'Third suggestion'},
    ],
    onClick: () => {
        // onClick handler
    },
    layout: 'list',
};

export const ListLayout: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Example suggestion'},
                {id: '2', title: 'Another one suggestion'},
                {id: '3', title: 'Looooooong suggestion for testing'},
            ]}
            layout="list"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const ListLayoutWithContainer: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper width="200px">
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Example suggestion'},
                {id: '2', title: 'Another one suggestion'},
                {id: '3', title: 'Looooooong suggestion for testing'},
            ]}
            layout="list"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const WrapTextListLayoutWithContainer: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper width="400px">
        <Suggestions
            {...args}
            items={[
                {
                    id: '1',
                    title: 'This is a short.',
                },
                {
                    id: '2',
                    title: 'This is a long suggestion text generated to be exactly 256 characters long for testing component behavior. It fills up space with enough repetition and verbosity to ensure that you can clearly see where truncation or overflow might appear.',
                },
                {
                    id: '3',
                    title: 'Another extra long suggestion exactly 256 characters in length. Used to test how well the UI handles longer entries and maintains design consistency.',
                },
            ]}
            layout="list"
            wrapText={true}
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const GridLayout: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Option 1'},
                {id: '2', title: 'Option 2'},
                {id: '3', title: 'Option 3'},
                {id: '4', title: 'Option 4'},
            ]}
            layout="grid"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const GridLayoutWithContainer: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper width="300px">
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Option 1'},
                {id: '2', title: 'Option 2'},
                {id: '3', title: 'Option 3'},
                {id: '4', title: 'Option 4'},
            ]}
            layout="grid"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const WithoutIds: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[{title: 'First item'}, {title: 'Second item'}, {title: 'Third item'}]}
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const SingleItem: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[{id: '1', title: 'Only one suggestion'}]}
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const TextAlignLeft: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Left aligned text'},
                {id: '2', title: 'Another left aligned suggestion'},
            ]}
            textAlign="left"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const TextAlignCenter: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Center aligned text'},
                {id: '2', title: 'Another centered suggestion'},
            ]}
            textAlign="center"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const TextAlignRight: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Right aligned text'},
                {id: '2', title: 'Another right aligned suggestion'},
            ]}
            textAlign="right"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const WithLeftIcon: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Previous page', icon: 'left'},
                {id: '2', title: 'Go back', icon: 'left'},
                {id: '3', title: 'Return to start', icon: 'left'},
            ]}
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const WithRightIcon: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Next page', icon: 'right'},
                {id: '2', title: 'Continue', icon: 'right'},
                {id: '3', title: 'Go forward', icon: 'right'},
            ]}
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const WithMixedIcons: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Previous', icon: 'left'},
                {id: '2', title: 'No action'},
                {id: '3', title: 'Next', icon: 'right'},
            ]}
            layout="grid"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const IconsWithContainer: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper width="200px">
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Example suggestion', icon: 'right'},
                {id: '2', title: 'Another one suggestion', icon: 'right'},
                {id: '3', title: 'Looooooong suggestion for testing', icon: 'right'},
            ]}
            layout="list"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const WithIconsInGridLayout: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            items={[
                {id: '1', title: 'Back', icon: 'left'},
                {id: '2', title: 'Home'},
                {id: '3', title: 'Settings'},
                {id: '4', title: 'Forward', icon: 'right'},
            ]}
            layout="grid"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const WithTitle: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            title="Try asking about:"
            items={[
                {id: '1', title: 'What is AI?'},
                {id: '2', title: 'How does machine learning work?'},
                {id: '3', title: 'What are neural networks?'},
            ]}
            layout="list"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);

export const WithTitleAndGridLayout: StoryFn<SuggestionsProps> = (args) => (
    <ContentWrapper>
        <Suggestions
            {...args}
            title="Popular topics"
            items={[
                {id: '1', title: 'Getting started'},
                {id: '2', title: 'Documentation'},
                {id: '3', title: 'API Reference'},
                {id: '4', title: 'Examples'},
            ]}
            layout="grid"
            onClick={() => {
                // onClick handler
            }}
        />
    </ContentWrapper>
);
