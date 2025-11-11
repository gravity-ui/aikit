# ActionButton

A button component with integrated tooltip functionality, combining Button and ActionTooltip from Gravity UI.

## Features

- **Tooltip Integration**: Seamlessly integrates ActionTooltip with Button component
- **Flexible Props**: Accepts all Button props plus tooltip-specific properties
- **Optional Tooltip**: Works as a regular button when no tooltip props are provided
- **Multiple Views**: Supports all Gravity UI button views (flat, outlined, flat-secondary, etc.)
- **Size Variants**: Available in four sizes: s, m, l, xl
- **Type Safety**: Full TypeScript support with proper prop types

## Usage

```tsx
import {ActionButton} from '@gravity-ui/aikit';
import {Icon} from '@gravity-ui/uikit';
import {Copy} from '@gravity-ui/icons';

// Basic usage with tooltip
<ActionButton
    tooltipTitle="Copy"
    view="flat"
    onClick={handleCopy}
>
    <Icon data={Copy} size={16} />
</ActionButton>

// Without tooltip (works as regular button)
<ActionButton
    view="outlined"
    onClick={handleClick}
>
    Click me
</ActionButton>

// With custom tooltip placement
<ActionButton
    tooltipTitle="Edit"
    tooltipPlacement="bottom"
    view="flat"
    size="l"
    onClick={handleEdit}
>
    <Icon data={Pencil} size={16} />
</ActionButton>

// Disabled state
<ActionButton
    tooltipTitle="Delete"
    disabled={true}
    view="flat-secondary"
    onClick={handleDelete}
>
    <Icon data={TrashBin} size={16} />
</ActionButton>
```

## Props

### Button Props

All props from Gravity UI Button component are supported. Common props include:

| Prop        | Type                                          | Required | Default | Description                     |
| ----------- | --------------------------------------------- | -------- | ------- | ------------------------------- |
| `onClick`   | `(event: React.MouseEvent) => void`           | -        | -       | Click event handler             |
| `view`      | `'flat' \| 'outlined' \| 'flat-secondary'...` | -        | -       | Button visual style             |
| `size`      | `'s' \| 'm' \| 'l' \| 'xl'`                   | -        | `'m'`   | Button size                     |
| `disabled`  | `boolean`                                     | -        | `false` | Disabled state                  |
| `children`  | `ReactNode`                                   | -        | -       | Button content                  |
| `className` | `string`                                      | -        | -       | Additional CSS class for button |
| `qa`        | `string`                                      | -        | -       | QA/test identifier              |
| `width`     | `'auto' \| 'max'`                             | -        | -       | Button width                    |
| `loading`   | `boolean`                                     | -        | `false` | Loading state                   |
| `selected`  | `boolean`                                     | -        | `false` | Selected state                  |
| `pin`       | `'round-round' \| 'brick-brick' \| ...`       | -        | -       | Button border radius style      |

### Tooltip Props

| Prop                | Type                                            | Required | Default | Description                            |
| ------------------- | ----------------------------------------------- | -------- | ------- | -------------------------------------- |
| `tooltipTitle`      | `string`                                        | -        | -       | Tooltip title text                     |
| `tooltipContent`    | `ReactNode`                                     | -        | -       | Tooltip content (alternative to title) |
| `tooltipPlacement`  | `'top' \| 'bottom' \| 'left' \| 'right' \| ...` | -        | `'top'` | Tooltip placement position             |
| `tooltipDisabled`   | `boolean`                                       | -        | `false` | Disable tooltip display                |
| `tooltipOpenDelay`  | `number`                                        | -        | -       | Delay before showing tooltip (ms)      |
| `tooltipCloseDelay` | `number`                                        | -        | -       | Delay before hiding tooltip (ms)       |
| `wrapperClassName`  | `string`                                        | -        | -       | Additional CSS class for wrapper       |

## Variants

## Tooltip Behavior

- Tooltip appears only if `tooltipTitle` is provided
- Without tooltip props, component works as a regular Button
- Tooltip placement can be customized via `tooltipPlacement`
- Tooltip can be temporarily disabled via `tooltipDisabled`

## Accessibility

The component implements the following accessibility features:

- Inherits all accessibility features from Gravity UI Button
- Tooltip provides additional context for screen readers
- Proper ARIA attributes from underlying Button component
- Keyboard navigation support (Tab, Enter, Space)

```tsx
/* Example: Using custom class */
<ActionButton tooltipTitle="Copy" className="custom-action-button" view="flat">
  <Icon data={Copy} size={16} />
</ActionButton>
```

## Implementation Details

The component conditionally wraps the Button with ActionTooltip only when tooltip props are provided. This ensures optimal performance and clean DOM structure when tooltips are not needed.

**Internal Logic**:

1. If `tooltipTitle` is provided → renders Button wrapped in ActionTooltip
2. If no tooltip props → renders Button directly without wrapper

This pattern allows using ActionButton as a drop-in replacement for Button throughout the application while maintaining backward compatibility.
