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

The header menu is rendered as a `Sheet` in mobile mode; `env(safe-area-inset-*)` is added by the component:

| Variable                                     | Default              | Description                        |
| -------------------------------------------- | -------------------- | ---------------------------------- |
| `--g-aikit-header-menu-sheet-inline-padding` | `var(--g-spacing-5)` | Side padding of the menu sheet     |
| `--g-aikit-header-menu-sheet-bottom-padding` | `var(--g-spacing-5)` | Bottom padding of the menu sheet   |
| `--g-aikit-header-menu-item-min-height`      | `44px`               | Menu item height (touch target)    |
| `--g-aikit-header-menu-item-inline-padding`  | `6px`                | Side padding of a menu item        |
| `--g-aikit-header-menu-item-icon-gap`        | `var(--g-spacing-4)` | Gap between the icon and the label |
| `--g-aikit-header-menu-item-font-size`       | `16px`               | Menu item font size in the sheet   |

### Button Group

| Variable                     | Default              | Description                                                                   |
| ---------------------------- | -------------------- | ----------------------------------------------------------------------------- |
| `--g-aikit-button-group-gap` | `var(--g-spacing-1)` | Gap between buttons; the mobile chat header raises it to `var(--g-spacing-2)` |

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

In mobile mode the history is a `Sheet`; these tokens shape it, `env(safe-area-inset-*)` is added by the component:

| Variable                                          | Default              | Description                              |
| ------------------------------------------------- | -------------------- | ---------------------------------------- |
| `--g-aikit-history-sheet-inline-padding`          | `var(--g-spacing-3)` | Side padding of the sheet                |
| `--g-aikit-history-sheet-bottom-padding`          | `var(--g-spacing-5)` | Bottom padding of the sheet              |
| `--g-aikit-history-sheet-list-padding`            | `0`                  | Padding of the chat list inside a sheet  |
| `--g-aikit-history-sheet-filter-inline-padding`   | `0`                  | Side padding of the search field         |
| `--g-aikit-history-sheet-filter-border-bottom`    | `none`               | Border under the search field            |
| `--g-aikit-history-sheet-item-inline-end-padding` | `0`                  | Padding between a row and the right edge |
| `--g-aikit-history-mobile-item-font-size`         | `16px`               | Chat name size in mobile mode            |
| `--g-aikit-history-mobile-item-line-height`       | `24px`               | Chat name line height in mobile mode     |

### Prompt Input

| Variable                                  | Default                                                                       | Description                    |
| ----------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| `--g-aikit-prompt-input-panel-max-height` | `500px`                                                                       | Max height of expandable panel |
| `--g-aikit-prompt-input-simple-padding`   | `var(--g-spacing-1) var(--g-spacing-1) var(--g-spacing-1) var(--g-spacing-3)` | Padding of the `simple` view   |
| `--g-aikit-prompt-input-full-padding`     | `var(--g-spacing-2)`                                                          | Padding of the `full` view     |

### Empty Container

| Variable                                       | Default                          | Description                                  |
| ---------------------------------------------- | -------------------------------- | -------------------------------------------- |
| `--g-aikit-empty-container-background`         | `var(--g-color-base-background)` | Empty-state background                       |
| `--g-aikit-empty-container-content-gap`        | `48px`                           | Gap between content blocks                   |
| `--g-aikit-empty-container-padding`            | `48px 32px`                      | Empty-state padding                          |
| `--g-aikit-empty-container-welcome-gap`        | `var(--g-spacing-6)`             | Gap between hero and text                    |
| `--g-aikit-empty-container-content-overflow-y` | `auto`                           | Vertical overflow of the empty-state content |

Mobile mode uses a parallel set of tokens, applied by the component itself:

| Variable                                       | Default                     | Description                               |
| ---------------------------------------------- | --------------------------- | ----------------------------------------- |
| `--g-aikit-empty-container-mobile-content-gap` | `32px`                      | Gap between content blocks in mobile mode |
| `--g-aikit-empty-container-mobile-padding`     | `80px var(--g-spacing-4) 0` | Empty-state padding in mobile mode        |
| `--g-aikit-empty-container-mobile-welcome-gap` | `18px`                      | Gap between hero and text in mobile mode  |

### Chat Content / Container

| Variable                                                      | Default                                                           | Description                                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `--g-aikit-chat-content-background`                           | `var(--g-color-base-background)`                                  | Content area background                                                                        |
| `--g-aikit-chat-content-padding`                              | derived                                                           | Content area padding                                                                           |
| `--g-aikit-chat-content-message-list-inline-padding`          | `var(--g-spacing-2)`                                              | Side padding of the message list                                                               |
| `--g-aikit-chat-container-background`                         | `var(--g-color-base-background)`                                  | Container background                                                                           |
| `--g-aikit-chat-container-mobile-font-size`                   | `16px`                                                            | Body text size in mobile mode                                                                  |
| `--g-aikit-chat-container-mobile-line-height`                 | `24px`                                                            | Body line height in mobile mode                                                                |
| `--g-aikit-chat-container-mobile-body-2-font-size`            | `16px`                                                            | `body-2` text size in mobile mode                                                              |
| `--g-aikit-chat-container-mobile-body-2-line-height`          | `20px`                                                            | `body-2` line height in mobile mode                                                            |
| `--g-aikit-chat-container-mobile-padding`                     | `var(--g-spacing-4)`                                              | Base layout padding in mobile mode                                                             |
| `--g-aikit-chat-container-mobile-empty-container-padding`     | `80px var(--g-spacing-4) 0`                                       | Empty-state padding inside a mobile chat                                                       |
| `--g-aikit-chat-container-mobile-message-list-inline-padding` | `calc(var(--g-aikit-layout-base-padding-m) + var(--g-spacing-2))` | Message list side padding in mobile mode; the calc resolves against `.g-root` values to `20px` |
| `--g-aikit-chat-container-header-background`                  | `var(--g-color-base-background)`                                  | Header band background                                                                         |
| `--g-aikit-chat-container-content-background`                 | `var(--g-color-base-background)`                                  | Content band background                                                                        |
| `--g-aikit-chat-container-footer-background`                  | `var(--g-color-base-background)`                                  | Footer band background                                                                         |
| `--g-aikit-chat-container-content-empty-background`           | `var(--g-color-base-background)`                                  | Empty-state content background                                                                 |
| `--g-aikit-chat-container-content-chat-background`            | `var(--g-color-base-background)`                                  | Active-chat content background                                                                 |
| `--g-aikit-chat-container-footer-empty-background`            | `var(--g-color-base-background)`                                  | Empty-state footer background                                                                  |
| `--g-aikit-chat-container-footer-chat-background`             | `var(--g-color-base-background)`                                  | Active-chat footer background                                                                  |

Header and footer metrics, each with a `mobile-` counterpart applied in mobile mode:

| Variable                                                       | Default                                                                              | Description                                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `--g-aikit-chat-container-header-height`                       | `auto`                                                                               | Header height                                                                                   |
| `--g-aikit-chat-container-header-padding`                      | `var(--g-aikit-layout-base-padding-m)`                                               | Header padding                                                                                  |
| `--g-aikit-chat-container-mobile-header-height`                | `60px`                                                                               | Minimum header height in mobile mode                                                            |
| `--g-aikit-chat-container-mobile-header-padding`               | `var(--g-spacing-2) var(--g-spacing-3)`                                              | Header padding in mobile mode                                                                   |
| `--g-aikit-chat-container-footer-padding`                      | `var(--g-aikit-layout-base-padding-m)`                                               | Footer padding                                                                                  |
| `--g-aikit-chat-container-footer-empty-padding`                | `var(--g-aikit-chat-container-footer-padding)`                                       | Footer padding on the welcome screen                                                            |
| `--g-aikit-chat-container-mobile-footer-padding`               | `var(--g-spacing-4) var(--g-aikit-chat-container-mobile-padding) var(--g-spacing-2)` | Footer padding in mobile mode                                                                   |
| `--g-aikit-chat-container-mobile-footer-empty-padding`         | `var(--g-spacing-2) var(--g-aikit-chat-container-mobile-padding)`                    | Welcome-screen footer in mobile mode                                                            |
| `--g-aikit-chat-container-mobile-suggestions-max-height`       | `40vh`                                                                               | Max height of the suggestions block above the input in mobile mode; the block scrolls beyond it |
| `--g-aikit-chat-container-mobile-suggestions-title-min-height` | `48px`                                                                               | Floor for the suggestions title above the input in mobile mode                                  |

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
