# InlineCitation

A compact inline source badge with an interactive source preview card.

## Features

- **Inline badge**: Displays the first source's hostname and the number of additional sources.
- **Source previews**: Shows a title, hostname, optional description, and quoted excerpt.
- **Multiple sources**: Previous/next buttons and a live position counter.
- **Accessible interactions**: Supports hover, keyboard focus, click, touch, and Escape.
- **Controlled visibility**: Supports both internal state and externally controlled opening.
- **Gravity themes**: Uses Gravity UI Popup, controls, links, and theme colors.

## Usage

```tsx
import {InlineCitation, type InlineCitationSource} from '@gravity-ui/aikit/InlineCitation';

const sources: InlineCitationSource[] = [
  {
    id: 'documentation',
    url: 'https://gravity-ui.com',
    title: 'Gravity UI documentation',
    description: 'Components for building modern interfaces.',
    quote: 'An open source design system.',
  },
];

<p>
  Read more in the documentation <InlineCitation sources={sources} />.
</p>;
```

Override the badge label or handle navigation yourself:

```tsx
<InlineCitation
  sources={sources}
  label="Documentation"
  onSourceClick={(source, event) => {
    event.preventDefault();
    openSourcePanel(source.id);
  }}
/>
```

Control visibility from the host application:

```tsx
const [open, setOpen] = useState(false);

<InlineCitation sources={sources} open={open} onOpenChange={setOpen} />;
```

### Markdown messages

The component consumes structured source data; it does not parse citation markers in Markdown.
Use the existing MDX integration to resolve source identifiers from each message's context:

```tsx
import {withPortal} from '@diplodoc/mdx-extension';
import {InlineCitation, type InlineCitationSource} from '@gravity-ui/aikit/InlineCitation';
import {MarkdownRenderer, useMdxContext} from '@gravity-ui/aikit/MarkdownRenderer';

function Citation({sourceId}: {sourceId?: string}) {
  const context = useMdxContext<{sources: InlineCitationSource[]}>();
  return (
    <InlineCitation sources={context?.sources.filter((source) => source.id === sourceId) ?? []} />
  );
}

<MarkdownRenderer
  content={'Read the documentation <Citation sourceId="documentation" />.'}
  mdxOptions={{components: {Citation: withPortal(Citation)}}}
  mdxContext={{sources}}
/>;
```

See [MarkdownRenderer](../MarkdownRenderer/README.md) for MDX configuration and CSP requirements.
Use `withPortal` so the embedded citation inherits the application's Gravity `ThemeProvider`.

## Props

| Prop            | Type                                                                                 | Required | Default        | Description                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ | -------- | -------------- | ------------------------------------------------------------------------------------------- |
| `sources`       | `readonly InlineCitationSource[]`                                                    | ✓        | -              | Sources with unique, stable identifiers. An empty array renders nothing.                    |
| `label`         | `string`                                                                             | -        | First hostname | Overrides the badge text; the additional source count is still displayed.                   |
| `open`          | `boolean`                                                                            | -        | -              | Controls card visibility. Pair with `onOpenChange` to accept interaction requests.          |
| `defaultOpen`   | `boolean`                                                                            | -        | `false`        | Initial visibility in uncontrolled mode.                                                    |
| `onOpenChange`  | `(open: boolean) => void`                                                            | -        | -              | Called when an interaction requests a visibility change.                                    |
| `onSourceClick` | `(source: InlineCitationSource, event: React.MouseEvent<HTMLAnchorElement>) => void` | -        | -              | Called when the source link is activated. Prevent the default event to override navigation. |
| `className`     | `string`                                                                             | -        | -              | Additional class applied to both the inline wrapper and portaled popup.                     |
| `qa`            | `string`                                                                             | -        | -              | QA identifier. The popup uses the identifier with a `-popup` suffix.                        |

### InlineCitationSource

| Field         | Type     | Required | Default  | Description                                                                                     |
| ------------- | -------- | -------- | -------- | ----------------------------------------------------------------------------------------------- |
| `id`          | `string` | ✓        | -        | Unique identifier; preserves selection when sources are reordered.                              |
| `url`         | `string` | ✓        | -        | Absolute HTTP(S) URL. Invalid URLs and unsupported protocols render as text without navigation. |
| `title`       | `string` | -        | Hostname | Source link title. Falls back to the localized “Source” label if the URL is invalid.            |
| `description` | `string` | -        | -        | Plain text source description.                                                                  |
| `quote`       | `string` | -        | -        | Plain text excerpt, preserving line breaks.                                                     |

Metadata is supplied by the host application. The component does not fetch pages, favicons, or previews.
Links open in a new tab with `noopener noreferrer`. If the selected source disappears, selection falls
back to the first available source. Navigation stops at the first and last sources.

## Keyboard and pointer support

- Hover with a mouse or focus the badge to preview sources without moving focus.
- Click the badge or press Enter/Space to keep the card open for interaction.
- Tab moves through the card's available controls and source link.
- Escape, the close button, or a click outside dismisses the card.
- Closing an interactively opened card returns focus to its badge when appropriate.
- Moving the pointer from the badge into the card keeps the preview open. A short close delay allows crossing the gap.

## Styling

| Variable                                  | Default                        | Description                                    |
| ----------------------------------------- | ------------------------------ | ---------------------------------------------- |
| `--g-aikit-inline-citation-card-width`    | `320px`                        | Preferred card width, limited by the viewport. |
| `--g-aikit-inline-citation-border-radius` | `--g-border-radius-m`          | Badge corner radius.                           |
| `--g-aikit-inline-citation-font-size`     | `--g-text-caption-2-font-size` | Badge font size.                               |
| `--g-color-base-generic`                  | Gravity theme                  | Badge background.                              |
| `--g-color-base-generic-hover`            | Gravity theme                  | Hovered and open badge background.             |
| `--g-color-text-primary`                  | Gravity theme                  | Card text and active badge color.              |
| `--g-color-text-secondary`                | Gravity theme                  | Badge, hostname, counter, and quote color.     |
| `--g-color-line-focus`                    | Gravity theme                  | Badge focus outline.                           |
| `--g-color-line-generic`                  | Gravity theme                  | Quote border color.                            |

Spacing follows Gravity tokens: `--g-spacing-half`, `--g-spacing-1`, `--g-spacing-2`,
`--g-spacing-3`, and `--g-spacing-8` control badge padding, gaps, card padding, and viewport
insets. Typography uses `--g-text-caption-2-font-size`, `--g-text-caption-2-line-height`,
`--g-text-body-1-font-size`, `--g-text-body-1-line-height`, and
`--g-text-subheader-font-weight`. The badge radius defaults to `--g-border-radius-m`.

Set custom properties on the supplied class so they also apply to the portaled card:

```css
.custom-citation {
  --g-aikit-inline-citation-card-width: 360px;
}
```

```tsx
<InlineCitation sources={sources} className="custom-citation" />
```
