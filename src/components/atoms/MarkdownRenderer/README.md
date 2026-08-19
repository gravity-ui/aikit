# MarkdownRenderer

A MarkdownRenderer component for rendering Yandex Flavored Markdown (YFM) content to HTML.

## Features

- **YFM Support**: Renders Yandex Flavored Markdown content
- **HTML Output**: Converts markdown to HTML
- **Transform Options**: Accepts custom options from the `@diplodoc/transform` package for advanced rendering control
- **MDX Support**: Optionally renders embedded MDX/JSX components via `@diplodoc/mdx-extension` (see `mdxOptions`)
- **Fenced code actions**: Mounts consumer-provided React actions into the native code block toolbar without replacing syntax highlighting, Copy, or Wrap controls

## Usage

```tsx
import {MarkdownRenderer} from '@/components/atoms/MarkdownRenderer';
import type {OptionsType} from '@diplodoc/transform/lib/typings';

<MarkdownRenderer content="# Hello World\n\nThis is **bold** text." />;

const transformOptions: OptionsType = {
  // Options from @diplodoc/transform
  // See: https://github.com/diplodoc-platform/transform
};

<MarkdownRenderer content="# Hello World" transformOptions={transformOptions} />;
```

### Fenced code block actions

Pass `codeBlockActions` to render React content before the native fenced-code controls. The
renderer can filter by language and return `null` for blocks that need no action. Inline code is
not included.

```tsx
import {useCallback, useMemo} from 'react';
import {Button} from '@gravity-ui/uikit';
import {
  MarkdownRenderer,
  type MarkdownCodeBlockActionsConfig,
} from '@/components/atoms/MarkdownRenderer';

function QueryMarkdown({
  content,
  openInEditor,
}: {
  content: string;
  openInEditor: (code: string) => void;
}) {
  const renderCodeBlockAction = useCallback<MarkdownCodeBlockActionsConfig['render']>(
    ({code, language}) => {
      if (language !== 'sql' && language !== 'yql') {
        return null;
      }

      return <Button onClick={() => openInEditor(code)}>Open in editor</Button>;
    },
    [openInEditor],
  );
  const codeBlockActions = useMemo<MarkdownCodeBlockActionsConfig>(
    () => ({
      render: renderCodeBlockAction,
      // Optional. The default is "hover".
      visibility: 'hover',
    }),
    [renderCodeBlockAction],
  );

  return <MarkdownRenderer content={content} codeBlockActions={codeBlockActions} />;
}
```

The callback receives:

- `code`: the original fenced content with one parser-added trailing LF removed;
- `language`: the lowercase first token from the fence info string, or `undefined`;
- `index`: the zero-based position among fenced blocks with a supported Diplodoc toolbar in this `MarkdownRenderer`.

Keep both the config object and `render` referentially stable across renders, and keep `render` free
of side effects. Replacing `render` can remount the custom action and reset its local React state.
With `visibility: 'always'`, the complete native toolbar is always visible only for blocks where
`render` returned content. Keyboard focus inside a custom action also keeps the toolbar visible.

`MessageList` and `ChatContainer` accept a per-message resolver, so products can filter by role,
streaming state, or any other message data before creating the low-level configuration:

```tsx
import {useCallback, useMemo} from 'react';
import {
  ChatContainer,
  type ChatStatus,
  type MarkdownCodeBlockActionsConfig,
  type TChatMessage,
} from '@gravity-ui/aikit';

function AssistantChat({messages, status}: {messages: TChatMessage[]; status: ChatStatus}) {
  const renderCodeBlockAction = useCallback<MarkdownCodeBlockActionsConfig['render']>(
    (block) => <OpenCodeButton block={block} />,
    [],
  );
  const codeBlockActions = useMemo<MarkdownCodeBlockActionsConfig>(
    () => ({render: renderCodeBlockAction}),
    [renderCodeBlockAction],
  );
  const getMarkdownCodeBlockActions = useCallback(
    (message: TChatMessage) =>
      message.role === 'assistant' && status === 'ready' ? codeBlockActions : undefined,
    [codeBlockActions, status],
  );

  return (
    <ChatContainer
      messages={messages}
      status={status}
      getMarkdownCodeBlockActions={getMarkdownCodeBlockActions}
    />
  );
}
```

Keep the resolver and each returned config referentially stable. The resolver is used by the
default assistant text renderer and by user messages with `format="markdown"`. Thinking parts,
tool messages, inline code, plain user messages, and custom message renderers are unchanged.

### MDX components

Pass `mdxOptions` to render embedded MDX/JSX tags as React components. Providing `mdxOptions`
enables MDX processing (powered by [`@diplodoc/mdx-extension`](https://www.npmjs.com/package/@diplodoc/mdx-extension)).

```tsx
import {MarkdownRenderer} from '@/components/atoms/MarkdownRenderer';

const Callout = ({title, children}: {title?: string; children?: React.ReactNode}) => (
  <div className="callout">
    <b>{title}</b>
    <div>{children}</div>
  </div>
);

const content = `# Notes

<Callout title="Heads up">
This block is rendered by a **React component**.
</Callout>`;

<MarkdownRenderer
  content={content}
  mdxOptions={{
    components: {Callout},
    // Optional: only treat these tags as MDX components
    tagNames: ['Callout'],
    // Required when the service enforces a nonce-based script-src CSP
    nonce: cspNonce,
  }}
/>;
```

> **Note:** When `mdxOptions` is provided, the content is transformed in a single full-content pass
> (block-level streaming caching is bypassed) because an MDX component can span multiple markdown
> blocks and its artifacts must be collected from the whole document.

Compiled MDX artifacts are executed through an inline `<script>` instead of `eval` or
`new Function`. Services with a nonce-based `script-src` Content Security Policy must pass the
nonce through `mdxOptions.nonce`; the renderer applies it to every temporary MDX script.
When `nonce` is omitted, the renderer preserves the extension's legacy `new Function` execution
path for backward compatibility.

### Per-message context (`mdxContext` + `useMdxContext`)

`mdxOptions.components` is a shared map, so the same component instance is reused for every message.
To pass data that is unique to a single message (its id, metadata, callbacks, etc.) into an embedded
MDX component, use `mdxContext`. The MDX portals rendered by `MarkdownRenderer` are wrapped in a
React context provider whose value is the `mdxContext` prop, and embedded components read it with the
`useMdxContext<T>()` hook. Because every message renders its own `MarkdownRenderer`, the value is
naturally scoped per message.

```tsx
import {MarkdownRenderer, useMdxContext} from '@/components/atoms/MarkdownRenderer';

type MessageMdxContext = {messageId: string; onAction: (id: string) => void};

// Read the per-message value inside an MDX component.
const ActionButton = ({label}: {label?: string}) => {
  const ctx = useMdxContext<MessageMdxContext>();
  return <button onClick={() => ctx?.onAction(ctx.messageId)}>{label}</button>;
};

<MarkdownRenderer
  content={'<ActionButton label="Run" />'}
  mdxOptions={{components: {ActionButton}}}
  mdxContext={{messageId: message.id, onAction} satisfies MessageMdxContext}
/>;
```

When rendering through `ChatContainer` / `MessageList`, supply a `getMdxContext(message)` resolver
instead of a static value. It is called with the concrete message and its return value becomes the
`mdxContext` for that message's `MarkdownRenderer`:

```tsx
<ChatContainer
  messages={messages}
  mdxProps={{
    mdxOptions: {components: {ActionButton}},
    getMdxContext: (message) => ({messageId: message.id, onAction}),
  }}
/>
```

## Props

| Prop                            | Type                             | Required | Default | Description                                                                                                                                                                                                             |
| ------------------------------- | -------------------------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`                       | `string`                         | Yes      | -       | YFM markdown content to render                                                                                                                                                                                          |
| `className`                     | `string`                         | -        | -       | Additional CSS class                                                                                                                                                                                                    |
| `qa`                            | `string`                         | -        | -       | QA/test identifier                                                                                                                                                                                                      |
| `transformOptions`              | `OptionsType`                    | -        | -       | Options from [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package                                                                                                                              |
| `shouldParseIncompleteMarkdown` | `boolean`                        | -        | `false` | Fix up unterminated markdown blocks (e.g. during streaming) before rendering                                                                                                                                            |
| `openLinksInNewTab`             | `boolean`                        | -        | `false` | Open rendered markdown links in a new tab, except hash-only links (`#local`) and relative same-document anchors with matching path and query. Adds `target="_blank"` and `rel="noopener noreferrer"` to matching links. |
| `mdxOptions`                    | `MarkdownRendererMdxOptions`     | -        | -       | Enables MDX rendering via [`@diplodoc/mdx-extension`](https://www.npmjs.com/package/@diplodoc/mdx-extension). When provided, embedded MDX/JSX tags are replaced with the supplied React components. See fields below.   |
| `mdxContext`                    | `unknown`                        | -        | -       | Arbitrary value exposed to the MDX components (rendered via `mdxOptions`) through a React context. Read it inside those components with `useMdxContext<T>()`. Scoped per `MarkdownRenderer` instance, i.e. per message. |
| `codeBlockActions`              | `MarkdownCodeBlockActionsConfig` | -        | -       | Renders React actions in fenced code block toolbars. Keep the config and `render` referentially stable. The default visibility is `hover`; use `always` to keep toolbars visible for blocks with rendered actions.      |

### `mdxOptions` fields

| Field        | Type            | Required | Default | Description                                                                                                       |
| ------------ | --------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `components` | `MDXComponents` | Yes      | -       | Map of tag name → React component used to render embedded MDX/JSX in the content (e.g. `{Callout, StatusBadge}`). |
| `tagNames`   | `string[]`      | -        | -       | Restricts which tags are processed as MDX components. When omitted, the extension's default detection is used.    |
| `nonce`      | `string`        | -        | -       | CSP nonce applied to temporary inline scripts. When omitted, MDX uses the legacy `new Function` execution path.   |

## Styling

The component uses CSS variables for theming:

| Variable                                           | Default | Description                                     |
| -------------------------------------------------- | ------- | ----------------------------------------------- |
| `--g-color-text-primary`                           | —       | Text color (via YFM theme)                      |
| `--g-aikit-markdown-renderer-table-cell-max-width` | `240px` | Max width of table body cells before text wraps |
| `--g-spacing-1`                                    | —       | Gap between custom code-block actions           |

The component also imports CSS from the [`@diplodoc/transform`](https://github.com/diplodoc-platform/transform) package. Additional CSS variables are provided by that package.

**Markdown tables**: a markdown-it plugin (via `@diplodoc/transform`) wraps each `<table>` in `__table-wrap` with `overflow-x: auto` so only the table scrolls horizontally when the table is wider than the message. Long words and inline `` `code` `` in cells wrap within `--g-aikit-markdown-renderer-table-cell-max-width`. `min-width: 100%` stretches narrow tables; `width: max-content` sizes columns to content.
