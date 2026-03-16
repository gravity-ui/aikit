# ActionPopup

Universal anchored popup container for displaying content near action buttons.

## Overview

`ActionPopup` is a flexible popup component that can be anchored to any element (typically action buttons). It provides a clean container with optional title and subtitle, and can contain any React content as children.

## Features

- **Anchored positioning**: Automatically positions relative to an anchor element
- **Flexible content**: Accepts any React content via children prop
- **Optional header**: Title and subtitle props for consistent header styling
- **Close button**: Built-in close button in header (when header is shown)
- **Customizable placement**: Supports all standard popup placements
- **Responsive**: Adapts to available space

## Usage

### Basic Usage

```tsx
import {ActionPopup} from '@gravity-ui/aikit';

function Example() {
  const [open, setOpen] = useState(false);
  const [anchorRef, setAnchorRef] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <Button ref={setAnchorRef} onClick={() => setOpen(true)}>
        Open Popup
      </Button>

      <ActionPopup
        open={open}
        onOpenChange={setOpen}
        anchorElement={anchorRef}
        title="Popup Title"
        subtitle="Optional subtitle"
        placement="bottom-start"
      >
        <div>Your content here</div>
      </ActionPopup>
    </>
  );
}
```

### With Feedback Form

```tsx
import {ActionPopup, FeedbackForm} from '@gravity-ui/aikit';

function FeedbackExample() {
  const [open, setOpen] = useState(false);
  const [anchorRef, setAnchorRef] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <Button ref={setAnchorRef} onClick={() => setOpen(true)}>
        Feedback
      </Button>

      <ActionPopup
        open={open}
        onOpenChange={setOpen}
        anchorElement={anchorRef}
        title="What went wrong?"
      >
        <FeedbackForm
          options={[
            {id: 'no-answer', label: 'No answer'},
            {id: 'wrong-info', label: 'Wrong information'},
          ]}
          onSubmit={(reasons, comment) => {
            console.log('Feedback:', reasons, comment);
            setOpen(false);
          }}
        />
      </ActionPopup>
    </>
  );
}
```

### Content Only (No Header)

```tsx
<ActionPopup open={open} onOpenChange={setOpen} anchorElement={buttonRef}>
  <Text>Simple message without header</Text>
</ActionPopup>
```

## Props

| Name            | Type                      | Default          | Required | Description                            |
| --------------- | ------------------------- | ---------------- | -------- | -------------------------------------- |
| `open`          | `boolean`                 | -                | Yes      | Controls popup open state              |
| `onOpenChange`  | `(open: boolean) => void` | -                | Yes      | Callback when popup open state changes |
| `anchorElement` | `HTMLElement \| null`     | -                | Yes      | Element to anchor the popup to         |
| `title`         | `string`                  | -                | No       | Optional title text in header          |
| `subtitle`      | `string`                  | -                | No       | Optional subtitle text in header       |
| `children`      | `React.ReactNode`         | -                | Yes      | Content to display in popup            |
| `placement`     | `PopupPlacement`          | `'bottom-start'` | No       | Popup placement relative to anchor     |
| `className`     | `string`                  | -                | No       | Additional CSS class                   |
| `qa`            | `string`                  | -                | No       | QA/test identifier                     |

## Placement Options

The `placement` prop accepts the following values:

- `'top-start'`, `'top'`, `'top-end'`
- `'right-start'`, `'right'`, `'right-end'`
- `'bottom-start'`, `'bottom'`, `'bottom-end'` (default)
- `'left-start'`, `'left'`, `'left-end'`

## Styling

The component uses BEM methodology with the block name `g-aikit-action-popup`:

- `.g-aikit-action-popup__container` - Main container
- `.g-aikit-action-popup__header` - Header section (when title or subtitle provided)
- `.g-aikit-action-popup__title` - Title text
- `.g-aikit-action-popup__subtitle` - Subtitle text
- `.g-aikit-action-popup__close-button` - Close button
- `.g-aikit-action-popup__content` - Content area

## Accessibility

- Close button includes proper `aria-label`
- Popup automatically manages focus
- Supports keyboard navigation (Escape to close)

## Related Components

- [`FeedbackForm`](../FeedbackForm/README.md) - Commonly used inside ActionPopup for collecting feedback
- [`MessageList`](../../organisms/MessageList/README.md) - Uses ActionPopup for action popups in messages
