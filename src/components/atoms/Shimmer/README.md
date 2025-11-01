# Shimmer

A loading animation component that creates a shimmer effect over its children.

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

## Customization

You can customize the shimmer effect using CSS variables:

| Variable                 | Default               | Description                 |
| ------------------------ | --------------------- | --------------------------- |
| `--g-aikit-shimmer-from` | `rgba(0, 0, 0, 0.35)` | Start/end color of gradient |
| `--g-aikit-shimmer-to`   | `rgba(0, 0, 0, 0.85)` | Middle color of gradient    |
| `--g-aikit-shimmer-time` | `2.5s`                | Animation duration          |

```css
.custom-shimmer {
  --g-aikit-shimmer-from: rgba(0, 0, 0, 0.5);
  --g-aikit-shimmer-to: rgba(0, 0, 0, 1);
  --g-aikit-shimmer-time: 3s;
}
```
