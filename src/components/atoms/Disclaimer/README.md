# Disclaimer

A Disclaimer component displays informational or warning messages

## Features

- **Text display**: Show disclaimer text using Gravity UI Text component
- **Children support**: Render custom content alongside or instead of text
- **Flexible layout**: Centered flex container with configurable gap

## Usage

```tsx
import {Disclaimer} from '@/components/atoms/Disclaimer';

// With text prop
<Disclaimer text="This is a disclaimer message" />

// With children
<Disclaimer>
  <span>Custom content</span>
</Disclaimer>

// With both text and children
<Disclaimer text="Disclaimer text">
  <span>Additional content</span>
</Disclaimer>
```

## Props

| Prop        | Type              | Required | Default | Description          |
| ----------- | ----------------- | -------- | ------- | -------------------- |
| `text`      | `string`          | -        | -       | Disclaimer text      |
| `children`  | `React.ReactNode` | -        | -       | Custom content       |
| `className` | `string`          | -        | -       | Additional CSS class |
| `qa`        | `string`          | -        | -       | QA/test identifier   |

## Styling

The component uses CSS variables for theming:

### Container

```css
--g-aikit-disclaimer-gap /* Gap size for content Disclaimer */
```

The text is rendered using Gravity UI's `Text` component with `color="secondary"`.
