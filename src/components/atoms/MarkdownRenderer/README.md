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

| Prop               | Type          | Required | Default | Description                                                                                |
| ------------------ | ------------- | -------- | ------- | ------------------------------------------------------------------------------------------ |
| `content`          | `string`      | Yes      | -       | YFM markdown content to render                                                             |
| `className`        | `string`      | -        | -       | Additional CSS class                                                                       |
| `qa`               | `string`      | -        | -       | QA/test identifier                                                                         |
| `transformOptions` | `OptionsType` | -        | -       | Options from [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package |

## Styling

The component uses CSS variables for theming:

| Variable                 | Description |
| ------------------------ | ----------- |
| `--g-color-text-primary` | Text color  |

The component also imports CSS from the [`@diplodoc/transform`](https://github.com/diplodoc-platform/transform) package. Additional CSS variables are provided by that package.
