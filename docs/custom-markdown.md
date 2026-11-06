# Using a custom Markdown renderer

Use `@gravity-ui/aikit/custom-markdown` to render Markdown on the server or with your own
engine. This entry exports the chat components, adapters, hooks, types, and
utilities without importing the built-in Diplodoc/MDX renderer.

```tsx
import {
  ChatContainer,
  MarkdownProvider,
  type MarkdownRendererProps,
} from '@gravity-ui/aikit/custom-markdown';

function ServerMarkdown({content}: MarkdownRendererProps) {
  return <YourMarkdown text={content} />;
}

<MarkdownProvider renderer={ServerMarkdown}>
  <ChatContainer {...chatProps} />
</MarkdownProvider>;
```

Define the renderer outside the parent component to keep its identity stable.
The provider applies to assistant text, Markdown-formatted user messages,
reasoning (including grouped steps), and AIStudioChat MCP request/response bodies.
Custom message renderers still take precedence over the default message registry.

The renderer receives `MarkdownRendererProps`, including content, class name,
QA attributes, and rendering options. It decides which options to support;
MDX, Mermaid, and incomplete Markdown processing are not added by the provider.
A component from this entry that renders Markdown without a provider throws an explanatory error.

The regular package entry and existing component subpaths retain their built-in
renderer. They also respect an explicit `MarkdownProvider`, but still import the
built-in engine. To exclude that engine from the bundle, import chat components
from `/custom-markdown` consistently. No Node.js module fallbacks are needed for this
entry itself; your renderer may have its own requirements.

## Transitional API

The `/custom-markdown` entry is a temporary compatibility solution until the next
major release. It lets applications supply a renderer without changing the default
behavior of existing imports.

The planned direction for the next major release is to require applications to
provide the Markdown renderer explicitly and offer the built-in engine as a
separate integration. The final API will be documented with that release.
