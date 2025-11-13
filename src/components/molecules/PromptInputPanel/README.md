# PromptInputPanel

A simple panel container component that displays custom content.

## Features

- **Flexible Content**: Accepts any React content as children
- **Simple Layout**: Provides consistent spacing and layout for panel content
- **Responsive**: Adapts to content size with flexible layout

## Usage

```tsx
import {PromptInputPanel} from '@gravity-ui/aikit';

// Basic usage
<PromptInputPanel>
  <div>Panel content goes here</div>
</PromptInputPanel>

// With complex content and close button
<PromptInputPanel>
  <div style={{flex: 1}}>
    <span>Upgrade your plan to Business</span>
  </div>
  <Button view="action">Upgrade</Button>
  <ActionButton view="flat" onClick={handleClose}>
    <Icon data={Xmark} size={16} />
  </ActionButton>
</PromptInputPanel>

// With swap area
<PromptInputPanel>
  <SwapArea />
</PromptInputPanel>
```

## Props

| Prop        | Type        | Required | Default | Description          |
| ----------- | ----------- | -------- | ------- | -------------------- |
| `children`  | `ReactNode` | -        | -       | Panel content        |
| `className` | `string`    | -        | -       | Additional CSS class |
| `qa`        | `string`    | -        | -       | QA/test identifier   |

## Behavior

- The panel provides a flex container with consistent padding and spacing
- Content is rendered as-is without any modifications
- Panel layout uses flexbox for flexible content arrangement

## Styling

The component uses CSS variables for theming:

| Variable        | Description         |
| --------------- | ------------------- |
| `--g-spacing-2` | Gap between content |

```css
/* Example: Custom theme */
.custom-panel {
  --g-spacing-2: 12px;
}
```

```tsx
/* Example: Inline styles */
<PromptInputPanel className="custom-panel" isOpen={true} onClose={handleClose}>
  Custom content
</PromptInputPanel>
```
