# Migration to AIKit v3

[English](migration-to-v3.md) | [Русский](migration-to-v3-ru.md)

## Overview

AIKit 3 upgrades `@gravity-ui/uikit` from v7 to v8. Upgrade both libraries together: AIKit 3 requires UIKit **8.0.0 or later within v8**, and no longer supports UIKit 7. React and React DOM **18 or 19** remain supported; Node.js now requires **20.19+ within v20, or 22.12+** (`^20.19.0 || >=22.12.0`).

This guide describes the changes from AIKit 2.28.0. See the [v3 release notes](changelog-v3.md) for the complete list. If upgrading from an earlier v2 release, also read the intervening entries in [CHANGELOG.md](../CHANGELOG.md).

## Quick checklist

1. Update Node.js to a supported version and AIKit and UIKit together, then check that your other Gravity packages support UIKit 8.
2. Use UIKit's `Provider` at the application root; keep nested `ThemeProvider` instances for theme overrides.
3. Replace the `xxs` size with `2xs` in context chips and control-size helpers.
4. Review custom history/menu styles and selectors against the new markup.
5. Regenerate custom UIKit themes with Themer v2 and check both light and dark modes.
6. Check history search, keyboard navigation, pinning/deletion, desktop menus, mobile sheets, file dialogs, prompt commands, and Mermaid streaming.

## Node.js runtime

Update development, CI, and SSR runtimes to Node.js **20.19+ within v20, or 22.12+**. Earlier Node 20/22 releases and Node 21 are no longer supported.

UIKit 8 eagerly exports ColorPicker, which loads ESM-only color dependencies even when a CommonJS consumer imports another component such as `@gravity-ui/aikit/Header`. Native `require(esm)` is enabled by default starting with [Node 20.19](https://nodejs.org/en/blog/release/v20.19.0) and [Node 22.12](https://nodejs.org/en/blog/release/v22.12.0). CSS handling remains the application's responsibility for SSR imports.

## Install compatible versions

```sh
npm install @gravity-ui/aikit@^3.0.0 @gravity-ui/uikit@^8.0.0
npm ls @gravity-ui/aikit @gravity-ui/uikit
```

The peer requirement and development dependency both start at `^8.0.0`. Use one compatible UIKit installation throughout the application so providers and consumers share their contexts. Upgrade other packages that require UIKit 7 before proceeding; do not mask incompatible peers with `--force` or `--legacy-peer-deps`.

Other required peers keep their existing ranges: `@gravity-ui/icons`, `@gravity-ui/i18n`, `@diplodoc/transform`, `highlight.js`, React, and React DOM. Mermaid remains an optional peer and is only loaded through the loader supplied by your application.

## Application provider

UIKit 8 separates theme overrides from application configuration. Move the root to `Provider`, including language, layout, default component props, and any mobile settings:

```diff
-import {ThemeProvider, MobileProvider} from '@gravity-ui/uikit';
+import {Provider} from '@gravity-ui/uikit';

-<ThemeProvider theme="light" lang="en">
-  <MobileProvider mobile={isMobile}>
-    <App />
-  </MobileProvider>
-</ThemeProvider>
+<Provider theme="light" lang="en" mobile={isMobile}>
+  <App />
+</Provider>
```

Keep nested theme overrides as `ThemeProvider`:

```tsx
import {Provider, ThemeProvider} from '@gravity-ui/uikit';

<Provider theme="light" lang="en">
  <App />
  <ThemeProvider theme="dark">
    <ChatPanel />
  </ThemeProvider>
</Provider>;
```

AIKit does not install a root provider for you. `ChatContainer.isMobile` still overrides its internal mobile context. When mobile mode is enabled, UIKit 8 also uses mobile rendering for dialogs and modals. Check the file upload dialog inside a mobile chat.

Continue importing styles at the application root:

```tsx
import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/aikit/styles';
```

The existing AIKit theme subpaths (`/themes/common`, `/themes/light`, `/themes/dark`, and `/themes/variables`) remain available. Use the stylesheet setup appropriate to your existing application.

AIKit translations now follow the nearest UIKit language provider through `i18n.useTranslation()`. Update `Provider.lang` to switch languages, or use `LangProvider` for an independent subtree. A global `configure({lang})` call is no longer needed when a language provider is present. See [Internationalization](I18N.md).

## ContextItem and control sizes

UIKit renames its smallest label size from `xxs` to `2xs`. `ContextItem.size` inherits UIKit's `LabelProps['size']`, and AIKit's exported `ControlSize` helper type follows the same rename:

```diff
-<ContextItem content="Source" size="xxs" />
+<ContextItem content="Source" size="2xs" />
```

Replace `xxs` in calls to `useMobileControlSize`, `resolveMobileControlSize`, and `getControlIconSize` too. Other sizes and the desktop/mobile defaults are unchanged.

## Chat history

`History` and `HistoryList` now use the stable UIKit 8 `List`, with a separate search input and a `grid` role to support the row's pin/delete buttons. Search is still a `combobox`; arrow keys and Enter work from it. Chat ids, pinning callbacks, grouping, custom filters, lazy loading, selected chats, and empty placeholders keep their AIKit APIs.

The list has an accessible name, `Chat history`. If your tests inspect rows, use its `grid`/`row`/`gridcell` roles or AIKit classes instead of legacy `.g-list__*` markup. The `.g-aikit-history__*` classes remain available; UIKit's row view now uses `.g-list-item-view`. Check custom row backgrounds, padding, selected states, and action-button focus.

`ChatFilterFunction` and `defaultChatFilter` now accept AIKit's `ListItemChatData` directly, instead of wrapping it in UIKit's legacy `ListItemData`. Typical callbacks need no changes. For explicit annotations:

```diff
-import type {ListItemData} from '@gravity-ui/uikit';
 import type {ListItemChatData} from '@gravity-ui/aikit';

-const matches = (item: ListItemData<ListItemChatData>) => /* ... */;
+const matches = (item: ListItemChatData) => /* ... */;
```

The data is still a union of a chat (`type: 'chat'`) and a date header (`type: 'date-header'`); narrow by `type` before reading chat fields.

History's mobile sheet uses UIKit's `open`/`onOpenChange` API internally. Applications continue to use `History.open` and `History.onOpenChange` as before.

## Header and attachment menus

`Header` and `AttachmentPicker` use the stable UIKit 8 `Menu` and `MenuItem`. The AIKit props remain the same: keep passing `Header.menuItems`, menu QA identifiers, labels, callbacks, disabled states, and attachment actions.

The mobile header menu is an inline menu inside a sheet. Desktop items use button-based `menuitem` markup. Replace selectors that expect `.g-dropdown-menu__*`, the old `.g-menu__*`, or `li > div[role="menuitem"]`. Prefer your existing `qa` identifiers or `getByRole('menuitem', {name: ...})`.

AIKit imports no components from `@gravity-ui/uikit/legacy`. Consumers do not need its drag-and-drop or legacy virtualization peers for AIKit.

## Dialogs and prompt popups

AIKit's `FileUploadDialog` keeps its `open`, `onClose`, `onApply`, and `onCancel` API. Internally it handles UIKit's `onOpenChange` and calls `onClose` when the dialog is dismissed. No callback rename is needed in AIKit consumers. Check the smaller UIKit 8 dialog spacing and mobile dialog layout.

Prompt command popups use `anchorElement` and `onOpenChange`. AIKit's command source configuration and imperative prompt API keep their existing signatures. Verify typed commands, context selection, the button-triggered search, and dismissal by Escape/outside click.

## Mermaid and server rendering

AIKit now imports the SSR-safe `useLayoutEffect` from UIKit, removing the temporary local React-hook adapter. Applications keep the same opt-in loader:

```tsx
<MarkdownRenderer content={content} mermaidOptions={{load: () => import('mermaid')}} />
```

Server rendering does not call the loader. On the client, cached SVG is restored in a layout effect before paint, including when streamed message HTML changes. No new provider or eager Mermaid import is needed.

## Themes, layout, and virtualized messages

AIKit's `--g-aikit-*` variables keep their names. UIKit 8's default palette changes can affect inherited colors. Regenerate custom UIKit themes with `@gravity-ui/uikit-themer` v2; the AIKit Themer already uses v2. Review both themes and any overrides of UIKit's removed tokens. Follow the [UIKit 8 migration guide](https://github.com/gravity-ui/uikit/blob/main/docs/migration-to-v8.md) for changes in your application's own UIKit components, layout, Selects, and CSS.

AIKit's loader and examples use `gap="spacing-2"` to retain the previous 8px spacing. In application code, migrate numeric UIKit Flex spacing to spacing tokens as described in that guide.

Virtualized `MessageList` continues using react-window v2. AIKit installs it as the npm alias `react-window-v2`, avoiding a conflict with UIKit's optional legacy peer `react-window@1`. Consumers need no new import or dependency; keep using AIKit's `virtualized` prop. If your application itself uses react-window v2 under its original package name, its own UIKit peer conflict must also be resolved.

## Verification after upgrading

- Run your type check, lint, production build, and integration tests with UIKit 8.0.0, the minimum supported version.
- Check at 375px, around 1000px, and 1400px in both themes. UIKit's `l` breakpoint now starts at 980px; configure 1080px explicitly in your application's layout if you need the previous threshold.
- Open history and menus with keyboard and pointer; search for a chat, select it, pin/unpin it, and delete it. Ensure action buttons do not select the row.
- Check full/lazy loading, no-results, empty history, and the mobile sheet with the keyboard open.
- Check file dialog Apply/Cancel/Escape, and prompt command selection/dismissal.
- Render with and without Mermaid enabled on the server; stream a message with a diagram and verify cached SVG does not flash as source code.
- Review screenshot differences before updating baselines: palette and menu changes are expected, overflow or missing content requires investigation.
