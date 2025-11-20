import React from 'react';

import type {
    ExtendedPluginWithCollect,
    MarkdownIt,
    OptionsType,
} from '@diplodoc/transform/lib/typings';
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

export const WithTransformOptions: StoryFn<MarkdownRendererProps> = () => {
    const customPlugin: ExtendedPluginWithCollect = ((md: MarkdownIt) => {
        const defaultRender =
            md.renderer.rules.strong_open ||
            function (tokens, idx, options, _env, self) {
                return self.renderToken(tokens, idx, options);
            };

        // eslint-disable-next-line no-param-reassign
        md.renderer.rules.strong_open = function (tokens, idx, options, _env, self) {
            const token = tokens[idx];
            token.attrSet(
                'style',
                'color: #ff6b6b; background-color: #fff5f5; padding: 2px 4px; border-radius: 3px;',
            );
            return defaultRender(tokens, idx, options, _env, self);
        };
    }) as ExtendedPluginWithCollect;

    const transformOptions: OptionsType = {
        plugins: [customPlugin],
    };

    const content = `# Custom Plugin Example\n\nThis is **bold text** with custom styling applied via plugin.`;

    return <MarkdownRenderer content={content} transformOptions={transformOptions} />;
};
