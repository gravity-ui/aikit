# MarkdownRenderer

A MarkdownRenderer component for rendering Yandex Flavored Markdown (YFM) content to HTML.

## Features

- **YFM Support**: Renders Yandex Flavored Markdown content
- **HTML Output**: Converts markdown to HTML
- **Transform Options**: Accepts custom options from the `@diplodoc/transform` package for advanced rendering control

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

## Props

| Prop                | Type          | Required | Default | Description                                                                                                                                             |
| ------------------- | ------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`           | `string`      | Yes      | -       | YFM markdown content to render                                                                                                                          |
| `className`         | `string`      | -        | -       | Additional CSS class                                                                                                                                    |
| `qa`                | `string`      | -        | -       | QA/test identifier                                                                                                                                      |
| `transformOptions`  | `OptionsType` | -        | -       | Options from [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package                                                              |
| `openLinksInNewTab` | `boolean`     | -        | `false` | Open rendered markdown links in a new tab, except in-page anchors (`#local`). Adds `target="_blank"` and `rel="noopener noreferrer"` to matching links. |

## Styling

The component uses CSS variables for theming:

| Variable                                           | Default | Description                                     |
| -------------------------------------------------- | ------- | ----------------------------------------------- |
| `--g-color-text-primary`                           | —       | Text color (via YFM theme)                      |
| `--g-aikit-markdown-renderer-table-cell-max-width` | `240px` | Max width of table body cells before text wraps |

The component also imports CSS from the [`@diplodoc/transform`](https://github.com/diplodoc-platform/transform) package. Additional CSS variables are provided by that package.

**Markdown tables**: a markdown-it plugin (via `@diplodoc/transform`) wraps each `<table>` in `__table-wrap` with `overflow-x: auto` so only the table scrolls horizontally. Table CSS resets inherited `word-break` from message wrappers. `min-width: 100%` stretches narrow tables; `width: max-content` sizes columns to content.
