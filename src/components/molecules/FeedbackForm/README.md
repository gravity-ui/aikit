# FeedbackForm

Reusable feedback form component with reason selection and comment field.

## Overview

`FeedbackForm` provides a user-friendly way to collect feedback with multiple selectable reasons (rendered as chips) and an optional comment field. It's designed to work standalone or inside popups like `ActionPopup`.

## Features

- **Multiple reason selection**: Clickable chips for selecting one or more reasons
- **Optional comment**: TextArea for additional feedback details
- **Fully customizable labels**: All text can be customized via props
- **Default i18n support**: Provides default labels in English and Russian
- **Disabled state**: Can disable all interactions
- **Flexible styling**: Chips automatically wrap to multiple lines if needed

## Usage

### Basic Usage

```tsx
import {FeedbackForm} from '@gravity-ui/aikit';

function Example() {
  const handleSubmit = (reasons: string[], comment: string) => {
    console.log('Selected reasons:', reasons);
    console.log('Comment:', comment);
    // Send feedback to backend
  };

  return (
    <FeedbackForm
      options={[
        {id: 'no-answer', label: 'No answer'},
        {id: 'wrong-info', label: 'Wrong information'},
        {id: 'not-helpful', label: 'Not helpful'},
        {id: 'other', label: 'Other'},
      ]}
      onSubmit={handleSubmit}
    />
  );
}
```

### With Custom Labels

```tsx
<FeedbackForm
  options={feedbackOptions}
  reasonsLabel="What went wrong?"
  commentLabel="Additional details"
  commentPlaceholder="Tell us more..."
  submitLabel="Send Feedback"
  onSubmit={handleSubmit}
/>
```

### Inside ActionPopup

```tsx
import {ActionPopup, FeedbackForm} from '@gravity-ui/aikit';

function FeedbackPopupExample() {
  const [open, setOpen] = useState(false);

  return (
    <ActionPopup
      open={open}
      onClose={() => setOpen(false)}
      anchorElement={buttonRef}
      title="What went wrong?"
    >
      <FeedbackForm
        options={[
          {id: 'no-answer', label: 'Нет ответа'},
          {id: 'not-helpful', label: 'Ответ не помог'},
          {id: 'wrong-info', label: 'Ошибочная информация'},
          {id: 'other', label: 'Другое'},
        ]}
        onSubmit={(reasons, comment) => {
          submitFeedback(reasons, comment);
          setOpen(false);
        }}
        commentPlaceholder="Расскажите подробнее"
        submitLabel="Отправить"
      />
    </ActionPopup>
  );
}
```

### With State Management

```tsx
function InteractiveExample() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (reasons: string[], comment: string) => {
    // Send to backend
    sendFeedback(reasons, comment);

    // Show success state
    setSubmitted(true);
  };

  if (submitted) {
    return <Text>Thank you for your feedback!</Text>;
  }

  return <FeedbackForm options={options} onSubmit={handleSubmit} />;
}
```

## Props

| Name                 | Type                                           | Default      | Required | Description                                           |
| -------------------- | ---------------------------------------------- | ------------ | -------- | ----------------------------------------------------- |
| `options`            | `FeedbackOption[]`                             | -            | Yes      | Array of reason options to display                    |
| `onSubmit`           | `(reasons: string[], comment: string) => void` | -            | Yes      | Callback when form is submitted                       |
| `reasonsLabel`       | `string`                                       | i18n default | No       | Label text for reasons section                        |
| `commentLabel`       | `string`                                       | -            | No       | Label text for comment field (hidden if not provided) |
| `commentPlaceholder` | `string`                                       | i18n default | No       | Placeholder text for comment field                    |
| `submitLabel`        | `string`                                       | i18n default | No       | Text for submit button                                |
| `disabled`           | `boolean`                                      | `false`      | No       | Disable all form interactions                         |
| `className`          | `string`                                       | -            | No       | Additional CSS class                                  |
| `qa`                 | `string`                                       | -            | No       | QA/test identifier                                    |

### FeedbackOption Type

```typescript
interface FeedbackOption {
  id: string; // Unique identifier for the option
  label: string; // Display label for the option
}
```

## Default i18n Labels

The component provides default labels that can be overridden:

**English:**

- `reasonsLabel`: "Select reasons"
- `commentPlaceholder`: "Tell us more..."
- `submitLabel`: "Submit"

**Russian:**

- `reasonsLabel`: "Выберите причины"
- `commentPlaceholder`: "Расскажите подробнее"
- `submitLabel`: "Отправить"

## Behavior

### Reason Selection

- Multiple reasons can be selected
- Click a chip to select/deselect it
- Selected chips use `Button` with `selected` prop
- Chips use `view="normal"` styling

### Submit Button State

- **Disabled when**: No reasons selected AND no comment entered
- **Enabled when**: At least one reason selected OR comment is entered
- This ensures users provide at least some feedback before submitting

### Form Submission

- `onSubmit` is called with two parameters:
  - `reasons`: array of selected reason IDs (e.g., `['no-answer', 'other']`)
  - `comment`: comment text (empty string if not provided)

## Styling

The component uses BEM methodology with the block name `g-aikit-feedback-form`:

- `.g-aikit-feedback-form` - Root container
- `.g-aikit-feedback-form__section` - Each section (reasons, comment)
- `.g-aikit-feedback-form__label` - Section labels
- `.g-aikit-feedback-form__reasons` - Reasons chip container
- `.g-aikit-feedback-form__reason-chip` - Individual reason chip
- `.g-aikit-feedback-form__comment` - Comment textarea
- `.g-aikit-feedback-form__submit` - Submit button

## Accessibility

- All form elements are keyboard accessible
- Chips can be activated with Enter/Space
- TextArea supports standard keyboard navigation
- Submit button is a proper form button

## Related Components

- [`ActionPopup`](../ActionPopup/README.md) - Commonly used as container for FeedbackForm
- [`MessageList`](../../organisms/MessageList/README.md) - Can use FeedbackForm in action popups
