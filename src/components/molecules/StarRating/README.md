# StarRating

A star rating component for displaying and collecting user ratings from 1 to 5 stars.

## Features

- **Interactive Rating**: Click on stars to set a rating value (1-5)
- **Hover Preview**: Visual preview when hovering over stars
- **Keyboard Navigation**: Full keyboard support with Tab, Enter, and Space keys
- **Accessible**: Proper ARIA labels and roles for screen readers
- **Size Variants**: Three size options - s (16px), m (20px), l (24px)
- **Disabled State**: Can be disabled to prevent interaction
- **Internationalization**: Built-in i18n support for English and Russian

## Usage

```tsx
import {StarRating} from '@gravity-ui/aikit';

// Basic usage
<StarRating value={3} onChange={(rating) => console.log(rating)} />

// With custom size
<StarRating value={4} onChange={handleRating} size="m" />

// Disabled state
<StarRating value={2} disabled />

// Uncontrolled (no initial value)
<StarRating onChange={handleRating} />

// With custom aria-label
<StarRating
  value={5}
  onChange={handleRating}
  aria-label="Rate your experience"
/>
```

## Props

| Prop         | Type                       | Required | Default | Description                         |
| ------------ | -------------------------- | -------- | ------- | ----------------------------------- |
| `value`      | `number`                   | -        | -       | Current rating value (1-5)          |
| `onChange`   | `(rating: number) => void` | -        | -       | Callback when rating changes        |
| `disabled`   | `boolean`                  | -        | `false` | Disabled state                      |
| `size`       | `'s' \| 'm' \| 'l'`        | -        | `'l'`   | Size of star icons                  |
| `aria-label` | `string`                   | -        | -       | Custom aria-label for accessibility |
| `className`  | `string`                   | -        | -       | Additional CSS class                |
| `qa`         | `string`                   | -        | -       | QA/test identifier                  |

## States

### Default State

Stars are displayed with empty outlines when no value is set or when hovering below the current value.

### Hover State

When hovering over a star, all stars up to and including the hovered star are filled, providing visual feedback.

### Selected State

Once a star is clicked, the rating is set and the filled stars persist even after the mouse moves away.

### Disabled State

When disabled, the component displays the current rating but does not respond to user interactions (clicks, hovers, keyboard).

## Sizes

- **s (small)**: 16px icons - compact size for inline usage
- **m (medium)**: 20px icons - standard size for forms
- **l (large)**: 24px icons - default size, best for prominent ratings like rating blocks

## Keyboard Support

- `Tab` - Navigate to and between star buttons
- `Enter` or `Space` - Select the focused star rating
- `Shift+Tab` - Navigate backwards

## Accessibility

The component implements comprehensive accessibility features:

- Uses semantic `<button>` elements for each star
- Implements `role="radiogroup"` for the container
- Each star has `role="radio"` and `aria-checked` attributes
- Provides descriptive `aria-label` for each star (e.g., "Rate 3 out of 5 stars")
- Supports keyboard navigation
- Announces rating changes to screen readers
- Disabled stars are properly marked with `disabled` attribute and `tabindex="-1"`

## Styling

The component uses CSS variables for theming:

| Variable                   | Description                     |
| -------------------------- | ------------------------------- |
| `--g-color-text-primary`   | Color of filled stars           |
| `--g-color-text-secondary` | Color of empty stars            |
| `--g-spacing-1`            | Gap between stars               |
| `--g-border-radius-xs`     | Border radius for focus outline |
| `--g-color-line-focus`     | Color of focus outline          |

```css
/* Example: Custom styling */
.custom-rating {
  --g-color-text-primary: #ffa500;
  --g-spacing-1: 12px;
}
```

```tsx
/* Example: Using custom class */
<StarRating value={4} onChange={handleRating} className="custom-rating" />
```

## Implementation Details

The component maintains internal hover state to provide visual feedback without affecting the actual value. When a user hovers over a star, all stars up to that position are temporarily filled. The hover state is cleared when the mouse leaves the component area.

The component uses the `Star` icon from `@gravity-ui/icons` for empty stars and `StarFill` for filled stars, ensuring consistent visual appearance with the Gravity UI design system.
