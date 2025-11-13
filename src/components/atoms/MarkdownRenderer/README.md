# MarkdownRenderer

A MarkdownRenderer component for rendering Yandex Flavored Markdown (YFM) content to HTML.

## Features

- **YFM Support**: Renders Yandex Flavored Markdown content
- **HTML Output**: Converts markdown to HTML

## Usage

```tsx
import {MarkdownRenderer} from '@/components/atoms/MarkdownRenderer';

<MarkdownRenderer content="# Hello World\n\nThis is **bold** text." />;
```

## Props

| Prop        | Type     | Required | Default | Description                    |
| ----------- | -------- | -------- | ------- | ------------------------------ |
| `content`   | `string` | Yes      | -       | YFM markdown content to render |
| `className` | `string` | -        | -       | Additional CSS class           |
| `qa`        | `string` | -        | -       | QA/test identifier             |

## Styling

The component uses CSS from `@diplodoc/transform` package. You can customize styles using CSS variables provided by the transform package.
