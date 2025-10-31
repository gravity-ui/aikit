# ContextIndicator

A circular progress indicator that visualizes context usage as a percentage (0-100%).

## Features

- **Visual Progress**: Circular ring fills clockwise based on percentage
- **Text Display**: Shows numeric percentage value
- **Two Input Modes**:
  - `percent`: Direct percentage value
  - `number`: Calculates percentage from used/max context
- **Theming**: Uses custom CSS variables with fallbacks to Gravity UI tokens

## Usage

```tsx
import {ContextIndicator} from '@/components/atoms/ContextIndicator';

// Direct percentage
<ContextIndicator type="percent" usedContext={75} />

// Calculated from numbers
<ContextIndicator type="number" usedContext={750} maxContext={1000} />

// With orientation
<ContextIndicator type="percent" usedContext={50} orientation="horizontal" />
<ContextIndicator type="percent" usedContext={50} orientation="vertical" />

// Reversed variants (value before indicator)
<ContextIndicator type="percent" usedContext={50} orientation="horizontal" reversed />
<ContextIndicator type="percent" usedContext={50} orientation="vertical" reversed />
```

## Props

| Prop          | Type                         | Required                 | Default        | Description                                                                         |
| ------------- | ---------------------------- | ------------------------ | -------------- | ----------------------------------------------------------------------------------- |
| `type`        | `'percent' \| 'number'`      | ✓                        | -              | Input mode: `'percent'` for direct value, `'number'` to calculate from used/max     |
| `usedContext` | `number`                     | ✓                        | -              | For `'percent'`: percentage value (0-100)<br/>For `'number'`: current context usage |
| `maxContext`  | `number`                     | ✓ (when `type='number'`) | -              | Maximum context available (only for `type='number'`)                                |
| `className`   | `string`                     | -                        | -              | Additional CSS class                                                                |
| `qa`          | `string`                     | -                        | -              | QA/test identifier                                                                  |
| `orientation` | `'horizontal' \| 'vertical'` | -                        | `'horizontal'` | Layout orientation                                                                  |
| `reversed`    | `boolean`                    | -                        | `false`        | Reverses the order of indicator and value text                                      |

## Styling

The component uses CSS variables for theming:

### Progress Colors

The progress ring color changes dynamically based on percentage:

```css
--g-aikit-ci-color-progress-1  /* 0-33%: Low usage */
--g-aikit-ci-color-progress-2  /* 34-65%: Medium usage */
--g-aikit-ci-color-progress-3  /* 66-100%: High usage */
```

### Background

```css
--g-aikit-color-bg-primary  /* Inner circle background */
```

### Typography

```css
--g-color-text-primary            /* Text color */
--g-text-body-font-family         /* Font family */
--g-text-body-1-font-size         /* Font size */
--g-text-body-font-weight         /* Font weight */
--g-text-body-1-line-height       /* Line height */
```
