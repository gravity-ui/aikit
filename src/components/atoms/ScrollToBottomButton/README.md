# ScrollToBottomButton

A circular button for returning to the latest chat message.

## Features

- Down arrow in the default state.
- Animated dots while streaming; hover or keyboard focus reveals the arrow.
- Native button semantics, disabled state, and forwarded ref.
- Reduced-motion support; touch devices always show the arrow.

## Usage

```tsx
import {ScrollToBottomButton} from '@gravity-ui/aikit';

<ScrollToBottomButton onClick={() => scrollToLatestMessage()} />;
```

```tsx
<ScrollToBottomButton
  streaming
  aria-label="Jump to latest response"
  onClick={scrollToLatestMessage}
/>
```

The parent decides when to show the button (for example, when the user scrolls away from the bottom), positions it above the composer, and handles scrolling. This atom never scrolls the document itself. Streaming dots are decorative and do not create repeated screen-reader announcements.

## Props

| Prop                 | Type                                   | Required | Default            | Description                                                         |
| -------------------- | -------------------------------------- | -------- | ------------------ | ------------------------------------------------------------------- |
| `waitingForApproval` | `boolean`                              | No       | `false`            | Show a hand instead of activity dots until hover or keyboard focus. |
| `streaming`          | `boolean`                              | No       | `false`            | Show activity dots until hover or keyboard focus.                   |
| `aria-label`         | `string`                               | No       | `Scroll to bottom` | Accessible button label; can be localized.                          |
| `disabled`           | `boolean`                              | No       | `false`            | Disable interaction.                                                |
| `onClick`            | `MouseEventHandler<HTMLButtonElement>` | No       | —                  | Callback for scrolling to the latest message.                       |
| `className`          | `string`                               | No       | —                  | Additional CSS class.                                               |
| `qa`                 | `string`                               | No       | —                  | Test identifier.                                                    |
| `ref`                | `Ref<HTMLButtonElement>`               | No       | —                  | Reference to the native button.                                     |

Other native button attributes are forwarded. The default button type is `button`.

## Styling

| Variable                                             | Default                       | Description              |
| ---------------------------------------------------- | ----------------------------- | ------------------------ |
| `--g-aikit-scroll-to-bottom-button-size`             | `32px`                        | Button width and height. |
| `--g-aikit-scroll-to-bottom-button-background`       | `--g-color-base-background`   | Background.              |
| `--g-aikit-scroll-to-bottom-button-background-hover` | `--g-color-base-simple-hover` | Hover background.        |
| `--g-aikit-scroll-to-bottom-button-border`           | `--g-color-line-generic`      | Border color.            |
| `--g-aikit-scroll-to-bottom-button-color`            | `--g-color-text-primary`      | Arrow color.             |
| `--g-color-text-secondary`                           | Theme value                   | Activity dot color.      |
| `--g-color-line-focus`                               | Theme value                   | Keyboard focus outline.  |

The `--g-aikit-scroll-to-bottom-button-shadow` variable controls the outer shadow (default: `0 2px 8px rgba(0, 0, 0, 0.16)`). The shadow remains visible on hover.
