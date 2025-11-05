import {Meta, StoryFn} from '@storybook/react';

import {Suggestions, SuggestionsProps} from '..';

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

export const Playground: StoryFn<SuggestionsProps> = (args) => <Suggestions {...args} />;
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
);

export const ListLayoutWithContainer: StoryFn<SuggestionsProps> = (args) => (
    <div style={{width: '200px', border: '1px solid red'}}>
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
    </div>
);

export const GridLayout: StoryFn<SuggestionsProps> = (args) => (
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
);

export const GridLayoutWithContainer: StoryFn<SuggestionsProps> = (args) => (
    <div style={{width: '300px', border: '1px solid red'}}>
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
    </div>
);

export const WithoutIds: StoryFn<SuggestionsProps> = (args) => (
    <Suggestions
        {...args}
        items={[{title: 'First item'}, {title: 'Second item'}, {title: 'Third item'}]}
        onClick={() => {
            // onClick handler
        }}
    />
);

export const SingleItem: StoryFn<SuggestionsProps> = (args) => (
    <Suggestions
        {...args}
        items={[{id: '1', title: 'Only one suggestion'}]}
        onClick={() => {
            // onClick handler
        }}
    />
);

export const TextAlignLeft: StoryFn<SuggestionsProps> = (args) => (
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
);

export const TextAlignCenter: StoryFn<SuggestionsProps> = (args) => (
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
);

export const TextAlignRight: StoryFn<SuggestionsProps> = (args) => (
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
);
