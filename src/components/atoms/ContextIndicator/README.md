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
```

## Props

The component accepts a discriminated union based on the `type` prop:

### Type: 'percent'

- `type`: `'percent'` - Use direct percentage value
- `usedContext`: `number` - Percentage value (0-100)
- `className?`: `string` - Additional CSS class
- `qa?`: `string` - QA/test identifier
- `orientation?`: `'horizontal' | 'vertical'` - Layout orientation (default: 'horizontal')

### Type: 'number'

- `type`: `'number'` - Calculate percentage from numbers
- `usedContext`: `number` - Current context usage
- `maxContext`: `number` - Maximum context available
- `className?`: `string` - Additional CSS class
- `qa?`: `string` - QA/test identifier
- `orientation?`: `'horizontal' | 'vertical'` - Layout orientation (default: 'horizontal')

## Styling

The component uses CSS variables for theming:

### Colors

```css
--ai-chat-line-brand              /* Progress ring color */
--ai-chat-base-background         /* Inner circle background */
--ai-chat-font-family             /* Text color */
```

### Typography

```css
--ai-chat-text-body-font-family   /* Font family for percentage text */
--ai-chat-text-body-1-font-size   /* Font size for percentage text */
--ai-chat-text-body-1-font-weight /* Font weight for percentage text */
--ai-chat-text-body-1-line-height /* Line height for percentage text */
```

### Fallbacks

All variables fall back to Gravity UI tokens when custom variables aren't defined:

- `--ai-chat-line-brand` → `--g-color-line-brand`
- `--ai-chat-base-background` → `--g-color-base-background`
- `--ai-chat-font-family` → `--g-color-text-primary`
- `--ai-chat-text-body-font-family` → `--g-font-family-sans`
- `--ai-chat-text-body-1-font-size` → `--g-text-body-1-font-size`
- `--ai-chat-text-body-1-font-weight` → `--g-text-body-font-weight`
- `--ai-chat-text-body-1-line-height` → `--g-text-body-1-line-height`
