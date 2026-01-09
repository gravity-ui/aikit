import {useEffect, useMemo, useRef, useState} from 'react';

import type {
    ExtendedPluginWithCollect,
    MarkdownIt,
    OptionsType,
} from '@diplodoc/transform/lib/typings';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {MarkdownRenderer, MarkdownRendererProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

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

type Story = StoryObj<typeof MarkdownRenderer>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

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

const STREAMING_CONTENT = `**This is a very long bold text that keeps going and going without a clear end, so you can see how unterminated bold blocks are handled by the renderer.**

*Here is an equally lengthy italicized sentence that stretches on and on, never quite reaching a conclusion, so you can observe how unterminated italic blocks behave in a streaming Markdown context, particularly when the content is verbose.*

\`This is a long inline code block that should be unterminated and continues for quite a while, including some code-like content such as const foo = "bar"; and more, to see how the parser deals with it when the code block is not properly closed\`

[This is a very long link text that is unterminated and keeps going to show how unterminated links are rendered in the preview, especially when the link text is verbose and the URL is missing or incomplete](https://gravity-ui.com/ru/libraries/aikit)`;

function StreamingMarkdownComparison() {
    const tokens = useMemo(() => STREAMING_CONTENT.split(''), []);
    const [content, setContent] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setContent('');
        let currentContent = '';
        let index = 0;

        intervalRef.current = setInterval(() => {
            if (index < tokens.length) {
                currentContent += tokens[index];
                setContent(currentContent);
                index += 1;
            }
            if (index >= tokens.length && intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }, 15);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [tokens]);

    return (
        <>
            <ShowcaseItem title="Without shouldParseIncompleteMarkdown (default)">
                <ContentWrapper width="400px">
                    <MarkdownRenderer content={content} shouldParseIncompleteMarkdown={false} />
                </ContentWrapper>
            </ShowcaseItem>
            <ShowcaseItem title="With shouldParseIncompleteMarkdown">
                <ContentWrapper width="400px">
                    <MarkdownRenderer content={content} shouldParseIncompleteMarkdown={true} />
                </ContentWrapper>
            </ShowcaseItem>
        </>
    );
}

export const WithParsingIncompleteMarkdown: StoryObj<typeof MarkdownRenderer> = {
    render: () => <StreamingMarkdownComparison />,
    decorators: defaultDecorators,
};
