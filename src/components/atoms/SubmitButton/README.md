# SubmitButton

A submit button component with state management through props and send/cancel icon switching.

## Features

- **State management through props**: Component state is controlled via a single `state` prop
- **Icon switching**: Automatically switches between ArrowUp (send) and Stop (cancel) icons depending on the state
- **Disabled state handling**: Properly handles the disabled button state
- **Sizes**: Supports three sizes: s, m, l

## Usage

```tsx
import {SubmitButton} from '@/components/atoms/SubmitButton';
import {useState} from 'react';

const [state, setState] = useState<'enabled' | 'disabled' | 'loading' | 'cancelable'>('enabled');

<SubmitButton
  onSend={async () => {
    setState('cancelable');
    await sendMessage();
    setState('enabled');
  }}
  onCancel={async () => {
    await cancelMessage();
    setState('enabled');
  }}
  state={state}
  size="m"
/>;
```

## Props

| Prop        | Type                                                   | Required | Default     | Description             |
| ----------- | ------------------------------------------------------ | -------- | ----------- | ----------------------- |
| `onSend`    | `() => Promise<void>`                                  | Yes      | -           | Data submission handler |
| `onCancel`  | `() => Promise<void>`                                  | Yes      | -           | Cancellation handler    |
| `state`     | `'enabled' \| 'disabled' \| 'loading' \| 'cancelable'` | No       | `'enabled'` | Button state            |
| `className` | `string`                                               | No       | -           | Additional CSS class    |
| `size`      | `'s' \| 'm' \| 'l'`                                    | No       | `'m'`       | Button size             |
| `qa`        | `string`                                               | No       | -           | QA/test identifier      |

## States

The component manages the following states through a single `state` prop:

- **enabled**: Enabled button state. The button is active and ready to submit data. Shows ArrowUp icon.
- **disabled**: Disabled button state. The button is inactive and clicks are not processed.
- **loading**: Loading state. Shows a loading indicator, button is inactive.
- **cancelable**: Cancellation state. Shows Stop icon, button is active for canceling the operation.

### State Logic

1. **enabled**: Default state. Shows ArrowUp icon, button is active.
2. **disabled**: Button is disabled and inactive.
3. **loading**: Shows loading indicator.
4. **cancelable**: Shows Stop icon, button is active for cancellation.

### State Management

The component does not manage states internally. All state management should be done in the parent component:

```tsx
const [state, setState] = useState<'enabled' | 'disabled' | 'loading' | 'cancelable'>('enabled');

const handleSend = async () => {
  setState('cancelable');
  try {
    await sendMessage();
  } finally {
    setState('enabled');
  }
};

const handleCancel = async () => {
  await cancelMessage();
  setState('enabled');
};

<SubmitButton onSend={handleSend} onCancel={handleCancel} state={state} />;
```

## Styling

The component uses CSS variables for theming:

### CSS Variables

```css
    --g-color-text-brand-contrast  /* Color of icons in button */
```

For customize Button - look gravity [doc](https://github.com/gravity-ui/uikit/tree/main/src/components/Button)
