# DiffStat

A compact component that displays diff statistics showing the number of added and deleted lines.

## Features

- **Visual Indicators**: Displays added and deleted line counts side by side
- **Sign Prefixes**: Automatically adds `+` for added lines and `-` for deleted lines (only when count > 0)
- **Color Coding**: Green for additions, red for deletions
- **Code Font**: Uses monospace font suitable for code contexts

## Usage

```tsx
import {DiffStat} from '@/components/atoms/DiffStat';

// Basic usage
<DiffStat added={10} deleted={5} />

// Only additions
<DiffStat added={15} deleted={0} />

// Only deletions
<DiffStat added={0} deleted={8} />

// No changes
<DiffStat added={0} deleted={0} />
```

## Props

| Prop        | Type            | Required | Default | Description             |
| ----------- | --------------- | -------- | ------- | ----------------------- |
| `added`     | `number`        | ✓        | -       | Number of added lines   |
| `deleted`   | `number`        | ✓        | -       | Number of deleted lines |
| `className` | `string`        | -        | -       | Additional CSS class    |
| `style`     | `CSSProperties` | -        | -       | Inline styles           |
| `qa`        | `string`        | -        | -       | QA/test identifier      |

## Styling

The component uses CSS variables for theming:

### Colors

```css
--g-color-text-positive-heavy  /* Added lines color (green) */
--g-color-text-danger          /* Deleted lines color (red) */
```

### Typography

```css
--g-text-code-font-family      /* Monospace font family */
--g-text-code-inline-1         /* Font size */
--g-text-code-font-weight      /* Font weight */
--g-text-code-inline-1-line-height  /* Line height */
```

### Layout

The component uses flexbox with a 4px gap between added and deleted counts.
