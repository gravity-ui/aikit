# Shimmer

A loading animation component that creates a shimmer effect over its children.

## Features

- **Shimmer Animation**: Applies an animated gradient mask over child content to indicate loading state
- **Customizable Colors**: Gradient colors are fully configurable via CSS variables
- **Configurable Duration**: Animation speed is controllable via CSS variables

## Usage

```tsx
import {Shimmer} from '@/components/atoms/Shimmer';

<Shimmer className="custom-class" qa="loading-shimmer">
  <div>Loading content...</div>
</Shimmer>;
```

## Props

| Prop        | Type        | Required | Default | Description                 |
| ----------- | ----------- | -------- | ------- | --------------------------- |
| `children`  | `ReactNode` | -        | -       | Content to apply shimmer to |
| `className` | `string`    | -        | -       | Additional CSS class        |
| `qa`        | `string`    | -        | -       | QA/test identifier          |

## Styling

The component uses CSS variables for theming:

| Variable                          | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| `--g-aikit-text-primary`          | Text color (defaults to `inherit`)               |
| `--g-aikit-shimmer-color-from`    | Start and end color of the shimmer gradient      |
| `--g-aikit-shimmer-color-to`      | Middle (highlight) color of the shimmer gradient |
| `--g-aikit-shimmer-gradient-size` | Width of the shimmer gradient mask               |
| `--g-aikit-shimmer-duration`      | Duration of the shimmer animation                |

```css
.custom-shimmer {
  --g-aikit-shimmer-color-from: rgba(0, 0, 0, 0.35);
  --g-aikit-shimmer-color-to: rgba(0, 0, 0, 0.85);
  --g-aikit-shimmer-gradient-size: 200%;
  --g-aikit-shimmer-duration: 2.5s;
}
```
