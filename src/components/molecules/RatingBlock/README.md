# RatingBlock

Universal rating block with title and star rating.

## Features

- Title with support for React elements (text, links, formatted content)
- Integrated 5-star rating component
- Configurable star size (s, m, l)
- Responsive layout with border and padding
- Link styling support in title

## Usage

```tsx
import {RatingBlock} from '@gravity-ui/aikit';

function MyComponent() {
  const [rating, setRating] = useState<number>();

  return (
    <RatingBlock
      title="Rate the assistant response:"
      value={rating}
      onChange={setRating}
      size="l"
    />
  );
}
```

## Dynamic title with link

```tsx
<RatingBlock
  title={
    rating && rating <= 2 ? (
      <>
        What went wrong? <a href="#feedback">Go to survey</a>
      </>
    ) : (
      'Rate the assistant response:'
    )
  }
  value={rating}
  onChange={setRating}
/>
```

## Props

| Prop        | Type                | Default | Description                  |
| ----------- | ------------------- | ------- | ---------------------------- |
| `title`     | `React.ReactNode`   | -       | Title text or React element  |
| `value`     | `number`            | -       | Current rating value (1-5)   |
| `onChange`  | `(rating) => void`  | -       | Callback when rating changes |
| `size`      | `'s' \| 'm' \| 'l'` | `'l'`   | Star size                    |
| `className` | `string`            | -       | Additional CSS class         |
| `qa`        | `string`            | -       | QA/test identifier           |

## Styling

The component uses Gravity UI design tokens:

- `--g-spacing-2` - Block padding (8px)
- `--g-spacing-1` - Header left padding (4px)
- `--g-spacing-2` - Gap between title sections (8px)
- `--g-spacing-3` - Gap in right section (12px)
- `--g-color-line-generic` - Border color
- `--g-border-radius-xl` - Border radius (10px)
- `--g-text-body-1` - Title font size and line height
- `--g-color-text-primary` - Title text color
- `--g-color-text-link` - Link color in title

## Use Cases

- **Customer satisfaction (CSAT) surveys** - AI assistant feedback collection
- **Product reviews** - E-commerce rating forms
- **Content rating** - Article, video, tutorial evaluation
- **Service feedback** - Support ticket satisfaction surveys
- **Educational** - Teacher or course ratings
