# Theming

AIKit uses CSS variables for theming, in the `--g-aikit-*` namespace. Values fall back to Gravity UI's `--g-color-*` system so AIKit picks up your existing uikit theme automatically.

## CSS Setup

Always import `common.css`, plus the matching theme variant:

```typescript
import '@gravity-ui/aikit/themes/common';
import '@gravity-ui/aikit/themes/light'; // or '/dark'
```

Switching between themes is done via `@gravity-ui/uikit`'s `<ThemeProvider>`, which writes `data-theme="light"` or `data-theme="dark"` onto a root element:

```tsx
import {ThemeProvider} from '@gravity-ui/uikit';

<ThemeProvider theme="dark">
    <ChatContainer …/>
</ThemeProvider>;
```

`variables.css` is **deprecated** — keep importing `common.css` only.

## Common Variables (`common.css`)

Defined under `.g-root`, applied regardless of theme.

### Colors

| Variable                               | Default                                                | Description                         |
| -------------------------------------- | ------------------------------------------------------ | ----------------------------------- |
| `--g-aikit-color-bg-primary`           | `var(--g-aikit-bg-primary, var(--g-color-base-float))` | Primary background                  |
| `--g-aikit-color-bg-secondary`         | `#f5f5f5`                                              | Secondary background                |
| `--g-aikit-color-bg-message-user`      | `#0077ff`                                              | User message bubble background      |
| `--g-aikit-color-bg-message-assistant` | `#f0f0f0`                                              | Assistant message bubble background |

### Layout

| Variable                          | Default | Description         |
| --------------------------------- | ------- | ------------------- |
| `--g-aikit-layout-base-padding-m` | `12px`  | Base medium padding |

### Disclaimer / Suggestions / Header

| Variable                           | Default                            | Description                   |
| ---------------------------------- | ---------------------------------- | ----------------------------- |
| `--g-aikit-disclaimer-gap`         | `10px`                             | Gap inside `Disclaimer`       |
| `--g-aikit-suggestions-box-shadow` | `0 3px 10px rgba(198,172,255,.52)` | Shadow on `Suggestions` items |
| `--g-aikit-header-background`      | `none`                             | Header background             |

### Context Indicator

| Variable                        | Default | Description        |
| ------------------------------- | ------- | ------------------ |
| `--g-aikit-ci-color-progress-1` | green   | Low-usage segment  |
| `--g-aikit-ci-color-progress-2` | orange  | Mid-usage segment  |
| `--g-aikit-ci-color-progress-3` | red     | High-usage segment |

### Shimmer

| Variable                          | Default           | Description            |
| --------------------------------- | ----------------- | ---------------------- |
| `--g-aikit-shimmer-color-from`    | `rgba(0,0,0,.35)` | Shimmer gradient start |
| `--g-aikit-shimmer-color-to`      | `rgba(0,0,0,.85)` | Shimmer gradient end   |
| `--g-aikit-shimmer-duration`      | `2.5s`            | Animation duration     |
| `--g-aikit-shimmer-gradient-size` | `200%`            | Gradient size          |

### History

| Variable                        | Default | Description              |
| ------------------------------- | ------- | ------------------------ |
| `--g-aikit-history-width`       | `360px` | History popup width      |
| `--g-aikit-history-max-height`  | `605px` | History popup max height |
| `--g-aikit-history-item-height` | `24px`  | Row height               |

### Prompt Input

| Variable                                  | Default | Description                    |
| ----------------------------------------- | ------- | ------------------------------ |
| `--g-aikit-prompt-input-panel-max-height` | `500px` | Max height of expandable panel |

### Empty Container

| Variable                                | Default                          | Description                |
| --------------------------------------- | -------------------------------- | -------------------------- |
| `--g-aikit-empty-container-background`  | `var(--g-color-base-background)` | Empty-state background     |
| `--g-aikit-empty-container-content-gap` | `48px`                           | Gap between content blocks |
| `--g-aikit-empty-container-padding`     | `48px 32px`                      | Empty-state padding        |

### Chat Content / Container

| Variable                                            | Default                          | Description                    |
| --------------------------------------------------- | -------------------------------- | ------------------------------ |
| `--g-aikit-chat-content-background`                 | `var(--g-color-base-background)` | Content area background        |
| `--g-aikit-chat-content-padding`                    | derived                          | Content area padding           |
| `--g-aikit-chat-container-background`               | `var(--g-color-base-background)` | Container background           |
| `--g-aikit-chat-container-header-background`        | `var(--g-color-base-background)` | Header band background         |
| `--g-aikit-chat-container-content-background`       | `var(--g-color-base-background)` | Content band background        |
| `--g-aikit-chat-container-footer-background`        | `var(--g-color-base-background)` | Footer band background         |
| `--g-aikit-chat-container-content-empty-background` | `var(--g-color-base-background)` | Empty-state content background |
| `--g-aikit-chat-container-content-chat-background`  | `var(--g-color-base-background)` | Active-chat content background |
| `--g-aikit-chat-container-footer-empty-background`  | `var(--g-color-base-background)` | Empty-state footer background  |
| `--g-aikit-chat-container-footer-chat-background`   | `var(--g-color-base-background)` | Active-chat footer background  |

## Light Theme Overrides (`light.css`)

Applied under `[data-theme='light']`:

| Variable                           | Value                         |
| ---------------------------------- | ----------------------------- |
| `--g-aikit-bg-secondary`           | `#f5f5f5`                     |
| `--g-aikit-bg-message-user`        | `#0077ff`                     |
| `--g-aikit-bg-message-assistant`   | `#f0f0f0`                     |
| `--g-aikit-text-primary`           | `#000000`                     |
| `--g-aikit-text-secondary`         | `#666666`                     |
| `--g-aikit-text-message-user`      | `#ffffff`                     |
| `--g-aikit-text-message-assistant` | `#000000`                     |
| `--g-aikit-border-color`           | `#e0e0e0`                     |
| `--g-aikit-accent-color`           | `#0077ff`                     |
| `--g-aikit-line-brand`             | `var(--g-aikit-accent-color)` |

## Dark Theme Overrides (`dark.css`)

Applied under `[data-theme='dark']`:

| Variable                           | Value                         |
| ---------------------------------- | ----------------------------- |
| `--g-aikit-bg-secondary`           | `#2a2a2a`                     |
| `--g-aikit-bg-message-user`        | `#0066cc`                     |
| `--g-aikit-bg-message-assistant`   | `#2a2a2a`                     |
| `--g-aikit-text-primary`           | `#ffffff`                     |
| `--g-aikit-text-secondary`         | `#999999`                     |
| `--g-aikit-text-message-user`      | `#ffffff`                     |
| `--g-aikit-text-message-assistant` | `#ffffff`                     |
| `--g-aikit-border-color`           | `#404040`                     |
| `--g-aikit-accent-color`           | `#0077ff`                     |
| `--g-aikit-line-brand`             | `var(--g-aikit-accent-color)` |
| `--g-aikit-shimmer-color-from`     | `rgba(255,255,255,.35)`       |
| `--g-aikit-shimmer-color-to`       | `rgba(255,255,255,.85)`       |

## Overriding Variables

Override at any selector level. Per-component scope is preferred:

```css
.my-chat .g-root {
  --g-aikit-color-bg-message-user: #6c5ce7;
  --g-aikit-color-bg-message-assistant: #2d3436;
}
```

For one-off overrides inline:

```tsx
<ChatContainer
    className="my-chat"
    style={{'--g-aikit-history-width': '480px'} as React.CSSProperties}
    …
/>
```

## Fallback Chain

Each `--g-aikit-color-*` variable falls back to a `--g-aikit-*` "raw" variable, then to a `--g-color-*` variable from Gravity UI:

```
--g-aikit-color-bg-primary
  → var(--g-aikit-bg-primary,
        var(--g-color-base-float))
```

This means: if you already set `--g-color-base-float` via `@gravity-ui/uikit`'s theming, AIKit picks it up automatically.
