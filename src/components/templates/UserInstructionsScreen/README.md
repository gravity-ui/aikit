# UserInstructionsScreen

Reusable instructions form for a secondary chat screen. Persistence belongs to the consumer.

## Features

- **Draft state**: Initializes from the saved value and protects unsaved edits from incoming updates.
- **Length limit**: Uses the same untrimmed JavaScript string length for the counter, input limit, and validation.
- **Async saving**: Prevents duplicate submission, displays pending state, and retains the draft after failure.
- **Navigation integration**: Reports dirty/saving state for the owning screen's leave check; ignores save completion after unmount.
- **Localization**: English and Russian defaults with optional text overrides.

## Usage

```tsx
import {UserInstructionsScreen} from '@gravity-ui/aikit';

<UserInstructionsScreen
  value={savedInstructions}
  maxLength={2000}
  onSave={saveInstructions}
  onSaved={returnToChat}
  onCancel={returnToChat}
/>;
```

Compose it with `ChatContainer` to reuse its title, Back, and Close actions:

```tsx
import {useRef, useState} from 'react';
import {ChatContainer, UserInstructionsScreen} from '@gravity-ui/aikit';
import type {UserInstructionsScreenState} from '@gravity-ui/aikit';

function ChatWithInstructions({value, onSave, confirmDiscard, onSendMessage, onClose}) {
  const [activeScreen, setActiveScreen] = useState('chat');
  const state = useRef<UserInstructionsScreenState>({dirty: false, saving: false});
  const returnToChat = () => setActiveScreen('chat');

  return (
    <ChatContainer
      activeScreen={activeScreen}
      onScreenChange={setActiveScreen}
      onSendMessage={onSendMessage}
      showClose
      onClose={onClose}
      screens={[
        {
          id: 'instructions',
          title: 'User instructions',
          menu: {label: 'User instructions'},
          beforeLeave: () => {
            if (state.current.saving) {
              return false;
            }
            return state.current.dirty ? confirmDiscard() : true;
          },
          render: ({pending}) => (
            <UserInstructionsScreen
              value={value}
              maxLength={2000}
              disabled={pending}
              onStateChange={(next) => {
                state.current = next;
              }}
              onSave={onSave}
              onSaved={returnToChat}
              onCancel={returnToChat}
            />
          ),
        },
      ]}
    />
  );
}
```

The template owns its form and Save/Cancel actions; `ChatContainer` owns the header and Back/Close leave checks. No duplicate header is rendered. Save and Cancel use authoritative controlled navigation after resolving the draft. Back/Close can ask the consumer to confirm discard; the template does not open a confirmation dialog itself. Forced availability fallback takes precedence even while saving.

## Props

| Prop            | Type                                           | Required | Default                      | Description                                                                                      |
| --------------- | ---------------------------------------------- | -------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `value`         | `string`                                       | ✓        | -                            | Saved instructions; updates a clean form without replacing a dirty draft.                        |
| `maxLength`     | `number`                                       | ✓        | -                            | Non-negative integer limit in UTF-16 code units. No trimming or normalization.                   |
| `onSave`        | `(value: string) => Promise<void>`             | ✓        | -                            | Persist the submitted value; reject on failure.                                                  |
| `onSaved`       | `() => void`                                   | -        | -                            | Successful completion for the current mounted visit, typically returns to chat.                  |
| `onCancel`      | `() => void`                                   | ✓        | -                            | Called after discarding the draft. Disabled while saving.                                        |
| `onStateChange` | `(state: UserInstructionsScreenState) => void` | -        | -                            | Reports `{dirty, saving}` on mount and when those flags change.                                  |
| `disabled`      | `boolean`                                      | -        | `false`                      | Disables editing and actions, e.g. while a leave confirmation is pending.                        |
| `texts`         | `UserInstructionsScreenTexts`                  | -        | Localized defaults           | Override `description`, `label`, `placeholder`, `save`, `cancel`, `saveError`, and `limitError`. |
| `className`     | `string`                                       | -        | -                            | Additional root class.                                                                           |
| `qa`            | `string`                                       | -        | `'user-instructions-screen'` | Root `data-qa` attribute.                                                                        |

An over-limit saved value remains visible and cannot be saved until shortened. Empty instructions are valid, allowing users to clear them. Reopening a screen initializes a fresh draft from `value`. Persistence can finish after unmount, but that visit will not invoke `onSaved` or update a later form. The consumer remains responsible for storage conflicts and updating `value` after a successful save.

## Styling

The component uses Gravity UI spacing tokens `--g-spacing-2`, `--g-spacing-3`, and `--g-spacing-5` and inherits the surrounding theme. It has no component-specific CSS variables. Its form fills the available content height, placing the action row below the field.

```css
.compact-instructions {
  --g-spacing-5: 16px;
}
```
