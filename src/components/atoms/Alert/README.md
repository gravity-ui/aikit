# Alert

An alert message with an indicator of alert's type opportunity to pass a button

## Features

- **Variants**: Show different icons for context using default icons
- **Retry button**: Opportunity to pass a callback for button
- **Customization**: Opportunity to pass a custom icon

## Usage

```tsx
import {Alert} from '@/components/atoms/Alert';

// Different variant
<Alert text="Alert" variant="default" />;
<Alert text="Alert" variant="info" />;
<Alert text="Alert" variant="warning" />;
<Alert text="Alert" variant="error" />;

// Action
<Alert text="Alert" action={{text: 'Retry', onClick: '()=>({})'}} />;
```

## Props

| Prop        | Type                                             | Required | Default     | Description          |
| ----------- | ------------------------------------------------ | -------- | ----------- | -------------------- |
| `text`      | `string`                                         | ✓        | -`          | Content of alert     |
| `variant`   | `'default' \| 'error' \| 'warning' \| 'success'` | -        | `'default'` | View                 |
| `icon`      | `ReactNode`                                      | -        | -           | Custom icon          |
| `action`    | `{text: 'string', onClick: () => void}`          | -        | -           | Action button        |
| `className` | `string`                                         | -        | -           | Additional CSS class |
| `qa`        | `string`                                         | -        | -           | QA/test identifier   |

## Styling

The component uses CSS variables for theming:

### Colors

```css
    --g-color-text-info  /* Info color */
    --g-color-text-warning-heavy   /* Warning color */
    --g-color-text-danger /* Streaming dots gap */
```

### Gaps

```css
    --g-spacing-2 /* Internal gap */
```
