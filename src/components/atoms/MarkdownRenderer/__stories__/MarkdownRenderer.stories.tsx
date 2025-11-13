import {Meta, StoryFn} from '@storybook/react-webpack5';

import {MarkdownRenderer, MarkdownRendererProps} from '..';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/MarkdownRenderer',
    component: MarkdownRenderer,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        content: {
            control: 'text',
            description: 'YFM markdown content to render',
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

export const Playground: StoryFn<MarkdownRendererProps> = (args) => <MarkdownRenderer {...args} />;
Playground.args = {
    content: '# Hello World\n\nThis is **bold** text and this is *italic* text.',
};
