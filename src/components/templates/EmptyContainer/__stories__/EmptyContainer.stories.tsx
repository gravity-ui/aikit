/* eslint-disable no-console */
import {useState} from 'react';

import {CircleInfo} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {EmptyContainer} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

export default {
    title: 'templates/EmptyContainer',
    component: EmptyContainer,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof EmptyContainer>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="600px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

const sampleSuggestions = [
    {id: '1', title: 'Summarize recent activity'},
    {id: '2', title: 'Check code for vulnerabilities'},
    {id: '3', title: 'Explain project structure'},
    {id: '4', title: 'Generate documentation'},
];

export const Playground: Story = {
    args: {
        image: (
            <Icon
                data={CircleInfo}
                size={120}
                style={{color: 'var(--g-color-text-complementary)'}}
            />
        ),
        title: 'Welcome to AI Chat',
        description:
            'Experience smarter, faster teamwork right inside your product! AI chat seamlessly integrates with your workflow – helping you with answering technical questions and much more.',
        suggestionTitle: "Don't know where to start from? Try this:",
        suggestions: sampleSuggestions,
        onSuggestionClick: (content, id) => {
            console.log('Suggestion clicked:', content, id);
        },
    },
    decorators: defaultDecorators,
};

export const Default: Story = {
    args: {
        title: 'Welcome to AI Chat',
        description:
            'Experience smarter, faster teamwork right inside your product! AI chat seamlessly integrates with your workflow – helping you with answering technical questions and much more.',
    },
    decorators: defaultDecorators,
};

export const WithImage: Story = {
    args: {
        image: (
            <Icon
                data={CircleInfo}
                size={120}
                style={{color: 'var(--g-color-text-complementary)'}}
            />
        ),
        title: 'Welcome to AI Chat',
        description: 'Ask me anything and I will help you with your tasks.',
    },
    decorators: defaultDecorators,
};

export const WithSuggestions: Story = {
    args: {
        title: 'Welcome to AI Chat',
        description: 'Get started with these helpful suggestions.',
        suggestionTitle: "Don't know where to start from? Try this:",
        suggestions: sampleSuggestions,
        onSuggestionClick: (content, id) => {
            console.log('Suggestion clicked:', content, id);
        },
    },
    decorators: defaultDecorators,
};

export const MinimalContent: Story = {
    args: {
        title: 'Welcome',
    },
    decorators: defaultDecorators,
};

export const OnlyDescription: Story = {
    args: {
        description: 'This is a simple empty state with only a description.',
    },
    decorators: defaultDecorators,
};

export const CustomSuggestions: Story = {
    args: {
        title: 'Quick Actions',
        suggestionTitle: 'Choose an action:',
        suggestions: [
            {id: '1', title: 'Start new conversation', view: 'outlined' as const},
            {id: '2', title: 'View history', view: 'flat' as const, icon: 'right' as const},
            {id: '3', title: 'Settings', view: 'flat' as const, icon: 'left' as const},
        ],
        onSuggestionClick: (content, id) => {
            console.log('Action clicked:', content, id);
        },
    },
    decorators: defaultDecorators,
};

export const LongContent: Story = {
    args: {
        title: 'Welcome to Our Advanced AI-Powered Chat Interface',
        description:
            'Experience the next generation of conversational AI technology that seamlessly integrates with your existing workflow. Our platform offers intelligent responses, context-aware suggestions, and advanced natural language processing capabilities to help you accomplish tasks faster and more efficiently. Whether you need help with code reviews, documentation, project planning, or answering complex technical questions, our AI assistant is here to support you every step of the way.',
        suggestionTitle: 'Here are some popular ways to get started with the platform:',
        suggestions: [
            {id: '1', title: 'Analyze and summarize recent project activity and changes'},
            {
                id: '2',
                title: 'Run comprehensive security audit and check code for vulnerabilities',
            },
            {id: '3', title: 'Generate detailed explanation of project structure and architecture'},
            {
                id: '4',
                title: 'Create comprehensive documentation for all public APIs and methods',
            },
        ],
        onSuggestionClick: (content, id) => {
            console.log('Suggestion clicked:', content, id);
        },
    },
    decorators: defaultDecorators,
};

export const WithLeftAlignment: Story = {
    args: {
        image: (
            <Icon
                data={CircleInfo}
                size={120}
                style={{color: 'var(--g-color-text-complementary)'}}
            />
        ),
        title: 'Welcome to AI Chat',
        description:
            'Experience smarter, faster teamwork right inside your product! All content is aligned to the left.',
        alignment: {
            image: 'left',
            title: 'left',
            description: 'left',
        },
        suggestionTitle: "Don't know where to start from? Try this:",
        suggestions: sampleSuggestions.slice(0, 3),
        onSuggestionClick: (content, id) => {
            console.log('Suggestion clicked:', content, id);
        },
    },
    decorators: defaultDecorators,
};

export const WithRightAlignment: Story = {
    args: {
        image: (
            <Icon
                data={CircleInfo}
                size={80}
                style={{color: 'var(--g-color-text-complementary)'}}
            />
        ),
        title: 'Welcome to AI Chat',
        description:
            'Experience smarter, faster teamwork right inside your product! All content is aligned to the right.',
        alignment: {
            image: 'right',
            title: 'right',
            description: 'right',
        },
        suggestionTitle: "Don't know where to start from? Try this:",
        suggestions: sampleSuggestions.slice(0, 3),
        onSuggestionClick: (content, id) => {
            console.log('Suggestion clicked:', content, id);
        },
    },
    decorators: defaultDecorators,
};

export const WithMixedAlignment: Story = {
    args: {
        image: (
            <Icon
                data={CircleInfo}
                size={64}
                style={{color: 'var(--g-color-text-complementary)'}}
            />
        ),
        title: 'Welcome to AI Chat',
        description: 'This example demonstrates mixed alignment: left title, right description.',
        alignment: {
            image: 'center',
            title: 'left',
            description: 'right',
        },
        suggestionTitle: "Don't know where to start from? Try this:",
        suggestions: sampleSuggestions.slice(0, 2),
        onSuggestionClick: (content, id) => {
            console.log('Suggestion clicked:', content, id);
        },
    },
    decorators: defaultDecorators,
};

export const WithShowMoreButton: Story = {
    args: {
        title: 'Welcome to AI Chat',
        description: 'Click the button below to load more suggestions.',
        suggestionTitle: "Don't know where to start from? Try this:",
        suggestions: sampleSuggestions.slice(0, 2),
        onSuggestionClick: (content, id) => {
            console.log('Suggestion clicked:', content, id);
        },
        showMore: () => {
            console.log('Show more clicked');
        },
    },
    decorators: defaultDecorators,
};

export const WithShowMoreButtonCustomText: Story = {
    args: {
        title: 'Welcome to AI Chat',
        description: 'Custom button text for loading more suggestions.',
        suggestionTitle: 'Popular actions:',
        suggestions: sampleSuggestions.slice(0, 2),
        onSuggestionClick: (content, id) => {
            console.log('Suggestion clicked:', content, id);
        },
        showMore: () => {
            console.log('Show more clicked');
        },
        showMoreText: 'Load more suggestions',
    },
    decorators: defaultDecorators,
};

export const WithShowMoreInteractive: Story = {
    render: (args) => {
        const [suggestions, setSuggestions] = useState(sampleSuggestions.slice(0, 2));
        const [hasMore, setHasMore] = useState(true);

        const loadMore = () => {
            if (suggestions.length < sampleSuggestions.length) {
                setSuggestions([
                    ...suggestions,
                    ...sampleSuggestions.slice(suggestions.length, suggestions.length + 2),
                ]);
            }
            if (suggestions.length + 2 >= sampleSuggestions.length) {
                setHasMore(false);
            }
        };

        return (
            <EmptyContainer
                {...args}
                suggestions={suggestions}
                showMore={hasMore ? loadMore : undefined}
            />
        );
    },
    args: {
        title: 'Welcome to AI Chat',
        description: 'Interactive example: click "Show more" to load additional suggestions.',
        suggestionTitle: "Don't know where to start from? Try this:",
        onSuggestionClick: (content, id) => {
            console.log('Suggestion clicked:', content, id);
        },
    },
    decorators: defaultDecorators,
};

export const CompleteExample: Story = {
    args: {
        image: (
            <Icon
                data={CircleInfo}
                size={120}
                style={{color: 'var(--g-color-text-complementary)'}}
            />
        ),
        title: 'Welcome to AI Chat',
        description:
            'Experience smarter, faster teamwork right inside your product! This example combines alignment and show more button.',
        alignment: {
            image: 'left',
            title: 'left',
            description: 'left',
        },
        suggestionTitle: "Don't know where to start from? Try this:",
        suggestions: sampleSuggestions.slice(0, 2),
        onSuggestionClick: (content, id) => {
            console.log('Suggestion clicked:', content, id);
        },
        showMore: () => {
            console.log('Show more clicked');
        },
        showMoreText: 'View all suggestions',
    },
    decorators: defaultDecorators,
};
