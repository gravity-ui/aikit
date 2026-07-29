import {useEffect, useMemo, useRef, useState} from 'react';

import type {
    ExtendedPluginWithCollect,
    MarkdownIt,
    OptionsType,
} from '@diplodoc/transform/lib/typings';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {MarkdownRenderer, MarkdownRendererProps, useMdxContext} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import {block} from '../../../../utils/cn';
import {BaseMessage} from '../../../molecules/BaseMessage';
import type {MarkdownRendererMdxOptions} from '../MarkdownRenderer';

import MDXDocs from './Docs.mdx';

import '../../../organisms/AssistantMessage/AssistantMessage.scss';

const assistantMessageB = block('assistant-message');

/** Same DOM as AssistantMessage: BaseMessage + __content wrapper (width 100%). */
function MarkdownTableInAssistantMessage({content}: {content: string}) {
    return (
        <ContentWrapper width="380px">
            <BaseMessage role="assistant">
                <div className={assistantMessageB('content')}>
                    <MarkdownRenderer content={content} />
                </div>
            </BaseMessage>
        </ContentWrapper>
    );
}

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

const MARKDOWN_TABLE = `| Full name | Code | Joined | Units | Score | Status | Location | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Anna Morgan | XM-901 | 2023-06-12 | 12 | 4.7 | Active | New York | Priority user |
| Wei Chen | BR-204 | 2024-01-08 | 3 | 3.2 | Pending | Singapore | Verification needed |
| Olivia Nielsen | DK-771 | 2022-11-30 | 48 | 5.0 | Active | Copenhagen | Premium tier |
| James O'Brien | PT-015 | 2024-09-01 | 0 | — | On hold | Dublin | Awaiting payment |
| Maria García-López | FL-888 | 2023-03-22 | 7 | 4.1 | Active | Barcelona | Standard plan |`;

const MARKDOWN_TEXT_AND_TABLE = `Here is the team overview for **region east**. This paragraph should wrap normally inside the assistant message and stay readable even when a wide table follows below.

${MARKDOWN_TABLE}

If you need to add or remove someone from this list, let me know. You can also paste a long URL like https://example.com/docs/team/overview and it should wrap without breaking the layout.`;

/** Text + wide table in one message: verify paragraphs wrap and the table scrolls horizontally. */
export const WithMarkdownTextAndTableInMessage: StoryObj<typeof MarkdownRenderer> = {
    render: () => <MarkdownTableInAssistantMessage content={MARKDOWN_TEXT_AND_TABLE} />,
    decorators: defaultDecorators,
};

export const WithMarkdownTableInMessage: StoryObj<typeof MarkdownRenderer> = {
    render: () => <MarkdownTableInAssistantMessage content={MARKDOWN_TABLE} />,
    decorators: defaultDecorators,
};

const MARKDOWN_TABLE_TWO_COLUMNS = `| Component | Price |
| --- | --- |
| CPU (2 cores) | 1 660 ₽ |
| RAM (2 GiB) | 443 ₽ |
| Disk (10 GiB SSD) | 143 ₽ |
| **Total** | **2 246 ₽** |`;

export const WithMarkdownTableTwoColumnsInMessage: StoryObj<typeof MarkdownRenderer> = {
    render: () => <MarkdownTableInAssistantMessage content={MARKDOWN_TABLE_TWO_COLUMNS} />,
    decorators: defaultDecorators,
};

const MARKDOWN_TABLE_LONG_CELL = `| Field | Value |
| --- | --- |
| Name | Anna |
| Notes | This is a very long description with many words separated by spaces that should wrap inside the cell instead of stretching the table on one line. |
| Token | super-long-unbroken-token-without-any-spaces-in-the-middle |
| Member ref | \`anna-morgan-member-reference-verification-east-01\` |
| Profile | \`{"name": "Anna Morgan", "code": "XM-901", "joined": "2023-06-12", "units": 12, "location": "New York"}\` |`;

/** Multi-word text, unbroken tokens, and inline code wrap at `--g-aikit-markdown-renderer-table-cell-max-width`. */
export const WithMarkdownTableLongCellInMessage: StoryObj<typeof MarkdownRenderer> = {
    render: () => <MarkdownTableInAssistantMessage content={MARKDOWN_TABLE_LONG_CELL} />,
    decorators: defaultDecorators,
};

/**
 * Markup a consumer renders with their own `@diplodoc/transform` usage: a bare
 * `.yfm` container that is NOT wrapped in AIKit's namespace class. `**bold**`
 * becomes `<strong>`, for which `@diplodoc/transform` ships `font-weight: 700`.
 * AIKit must not leak its `.yfm` overrides onto this standalone content.
 */
const STANDALONE_TRANSFORM_HTML = '<p>This is <strong>bold</strong> text.</p>';

export const StyleIsolation: StoryObj<typeof MarkdownRenderer> = {
    render: () => (
        <>
            <MarkdownRenderer qa="aikit-yfm" content="This is **bold** text." />
            <div
                className="yfm"
                data-qa="standalone-yfm"
                dangerouslySetInnerHTML={{__html: STANDALONE_TRANSFORM_HTML}}
            />
        </>
    ),
    decorators: defaultDecorators,
};

/**
 * MDX support via `@diplodoc/mdx-extension`. Passing `mdxOptions` enables MDX
 * processing: custom tags embedded in the markdown are replaced with the React
 * components provided in `mdxOptions.components`. Use `mdxOptions.tagNames` to
 * limit which tags are treated as MDX components.
 */
const MDX_CONTENT = `# Release notes

Here is an inline status badge rendered from MDX: <StatusBadge status="success" />

You can also embed a richer callout component:

<Callout title="Heads up">
This block is rendered by a **React component**, not plain HTML.
</Callout>

Regular markdown such as *emphasis*, \`inline code\`, and [links](https://gravity-ui.com/ru/libraries/aikit) keeps working alongside MDX components.`;

const MDX_TAG_NAMES = ['StatusBadge', 'Callout'];

const StatusBadge = ({status}: {status?: string}) => {
    const isSuccess = status === 'success';
    return (
        <span
            style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: isSuccess ? '#3aa13a' : '#c94040',
            }}
        >
            {isSuccess ? 'SUCCESS' : 'FAILED'}
        </span>
    );
};

const Callout = ({title, children}: {title?: string; children?: React.ReactNode}) => (
    <div
        style={{
            margin: '12px 0',
            padding: '12px 16px',
            borderLeft: '4px solid #4d8fea',
            borderRadius: '4px',
            backgroundColor: 'rgba(77, 143, 234, 0.1)',
        }}
    >
        {title ? <div style={{fontWeight: 600, marginBottom: '4px'}}>{title}</div> : null}
        <div>{children}</div>
    </div>
);

const MDX_COMPONENTS = {
    StatusBadge,
    Callout,
} satisfies MarkdownRendererMdxOptions['components'];

const MDX_OPTIONS: MarkdownRendererMdxOptions = {
    components: MDX_COMPONENTS,
    tagNames: MDX_TAG_NAMES,
};

/**
 * Renders markdown that embeds custom MDX components (`<StatusBadge />` and
 * `<Callout />`) resolved from `mdxOptions.components`.
 */
export const WithMdxComponents: StoryObj<typeof MarkdownRenderer> = {
    render: () => (
        <ContentWrapper width="480px">
            <MarkdownRenderer content={MDX_CONTENT} mdxOptions={MDX_OPTIONS} />
        </ContentWrapper>
    ),
    decorators: defaultDecorators,
};

type MessageMdxContext = {
    messageId: string;
    onAction: (messageId: string) => void;
};

/**
 * MDX component that reads per-message data from `useMdxContext`. The same
 * component instance is reused across messages, but each `MarkdownRenderer`
 * provides its own `mdxContext`, so the button always acts on the message it
 * belongs to.
 */
const MessageActionButton = ({label}: {label?: string}) => {
    const ctx = useMdxContext<MessageMdxContext>();

    return (
        <button
            type="button"
            onClick={() => ctx?.onAction(ctx.messageId)}
            style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #4d8fea',
                background: 'transparent',
                color: '#4d8fea',
                cursor: 'pointer',
            }}
        >
            {label ?? 'Action'} (message {ctx?.messageId})
        </button>
    );
};

const MDX_CONTEXT_COMPONENTS = {
    MessageActionButton,
} satisfies MarkdownRendererMdxOptions['components'];

const MDX_CONTEXT_OPTIONS: MarkdownRendererMdxOptions = {
    components: MDX_CONTEXT_COMPONENTS,
    tagNames: ['MessageActionButton'],
};

/**
 * Demonstrates per-message context: two `MarkdownRenderer` instances share the
 * same `mdxOptions.components` map but receive different `mdxContext` values.
 * The embedded `<MessageActionButton />` reads its message-specific data with
 * `useMdxContext`.
 */
export const WithMdxContext: StoryObj<typeof MarkdownRenderer> = {
    render: () => {
        const onAction = (messageId: string) => {
            // eslint-disable-next-line no-alert
            window.alert(`Action from message ${messageId}`);
        };

        return (
            <ContentWrapper width="480px">
                <MarkdownRenderer
                    content={'First message:\n\n<MessageActionButton label="Run" />'}
                    mdxOptions={MDX_CONTEXT_OPTIONS}
                    mdxContext={{messageId: 'msg-1', onAction} satisfies MessageMdxContext}
                />
                <MarkdownRenderer
                    content={'Second message:\n\n<MessageActionButton label="Run" />'}
                    mdxOptions={MDX_CONTEXT_OPTIONS}
                    mdxContext={{messageId: 'msg-2', onAction} satisfies MessageMdxContext}
                />
            </ContentWrapper>
        );
    },
    decorators: defaultDecorators,
};

/**
 * Demonstrates `extraProps` — arbitrary `div` attributes forwarded to the root
 * container of the rendered markdown. Useful for attaching event handlers
 * (e.g. `onClick`), `data-*` attributes, `title`, `role`, etc.
 *
 * To bind a handler to a specific message, resolve `extraProps` per message
 * (this is exactly what `MessageList` / `ChatContainer` do via the
 * `getMarkdownExtraProps(message)` resolver).
 */
export const WithExtraProps: StoryObj<typeof MarkdownRenderer> = {
    render: () => {
        const messages = [
            {id: 'msg-1', text: 'First message: **click me**.'},
            {id: 'msg-2', text: 'Second message: **click me too**.'},
        ];

        // Mirrors `getMarkdownExtraProps(message)`: each message gets its own
        // handler bound to its id, so the click knows which message fired it.
        const getExtraProps = (messageId: string) => ({
            role: 'button',
            'data-message-id': messageId,
            style: {cursor: 'pointer'},
            onClick: () => {
                // eslint-disable-next-line no-alert
                window.alert(`Clicked message ${messageId}`);
            },
        });

        return (
            <ContentWrapper width="480px">
                {messages.map((message) => (
                    <MarkdownRenderer
                        key={message.id}
                        content={message.text}
                        extraProps={getExtraProps(message.id)}
                    />
                ))}
            </ContentWrapper>
        );
    },
    decorators: defaultDecorators,
};
