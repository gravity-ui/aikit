# Troubleshooting

Common issues when integrating `@gravity-ui/aikit`.

## Peer Dependencies

AIKit declares the following peer dependencies. Your app must install them:

```bash
npm install \
  @gravity-ui/uikit@^7.25 \
  @gravity-ui/icons@^2.16 \
  @gravity-ui/i18n@^1.8 \
  @diplodoc/transform@^4.63 \
  highlight.js@^11.11 \
  react@^18 react-dom@^18
```

If you see `Module not found: @gravity-ui/uikit` (or similar) after installing AIKit, you're missing one of the peers above.

## Themes / Dark Mode Not Applying

Three things must all be in place:

1. **Theme CSS imported once at app root:**
   ```typescript
   import '@gravity-ui/aikit/themes/common';
   import '@gravity-ui/aikit/themes/dark';
   ```
2. **`<ThemeProvider>` wrapping AIKit components** (from `@gravity-ui/uikit`). It writes `data-theme="dark"` onto the root element.
3. **`.g-root` class on a parent**, which is added automatically by `<ThemeProvider>`. If you bypass `<ThemeProvider>`, you must set `class="g-root"` manually.

```tsx
import {ThemeProvider} from '@gravity-ui/uikit';

<ThemeProvider theme="dark">
    <ChatContainer …/>
</ThemeProvider>;
```

## Markdown Not Rendering

`MarkdownRenderer` requires `@diplodoc/transform` and `highlight.js` (both are peer deps). If they're missing, markdown content falls back to plain text without errors. Re-install peers if so.

Code blocks specifically need `highlight.js` styles. If syntax highlighting is missing, also import a highlight.js theme:

```typescript
import 'highlight.js/styles/github.css'; // or your preferred theme
```

## Server-Side Code Won't Build

`@gravity-ui/aikit/server/openai` depends on the optional `openai` and `semver` packages, which are **not installed by default**:

```bash
npm install openai semver
```

The server code is shipped in a separate target (`build/server/`); make sure your bundler treats this subpath as Node-only.

## Portal-Mounted Dialogs Missing from Component Screenshots

If you're writing Playwright Component Tests for a component that opens `FileUploadDialog` (or any portal-mounted dialog), `expectScreenshot()` without options won't capture the dialog. Use full-page mode:

```tsx
await expectScreenshot({component: page, fullPage: true});
```

See [TESTING.md](./TESTING.md) and the [Playwright dialog testing notes](./guidelines/testing.md).

## `usePromptBox` / `PromptBox` Imports Failing

These were renamed. Use the current API:

| Old            | New                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------- |
| `PromptBox`    | `PromptInput`                                                                             |
| `usePromptBox` | no direct equivalent; compose `PromptInput` or build with `PromptInputBody/Header/Footer` |

## `import {…} from 'aikit'` Fails

The package name is `@gravity-ui/aikit`, not `aikit`. Use:

```typescript
import {ChatContainer} from '@gravity-ui/aikit';
```

## TypeScript: `Cannot find module '@gravity-ui/aikit/X'`

Subpath imports (`@gravity-ui/aikit/Header`, `/themes/dark`, etc.) require either `moduleResolution: "Bundler"` or `"NodeNext"` in your `tsconfig.json`. If you're on the legacy `"Node"` resolution, switch to one of the above or use the main entry only.

## Bundle Size

The main entry (`@gravity-ui/aikit`) re-exports everything. For smaller bundles, import individual components via their subpaths:

```typescript
// Tree-shakable
import {Header} from '@gravity-ui/aikit/Header';

// Pulls in the whole library (still tree-shakes with a modern bundler, but slower)
import {Header} from '@gravity-ui/aikit';
```

## Where to Report Issues

<https://github.com/gravity-ui/aikit/issues>
