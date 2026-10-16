# AIKit Themer

Open **Theming → Themer → Playground** in [AIKit Storybook](https://preview.gravity-ui.com/aikit/) to edit a theme alongside a live AIKit chat. The editor uses the same `@gravity-ui/uikit-themer` generator as Gravity Themer and UIKit's current Storybook theme importer, with UIKit controls and `chroma-js` color validation.

## Run locally

```sh
npm ci
npm start -- --port 6006 --no-open
```

Open [the editor](http://localhost:6006/?path=/story/theming-themer--playground), or choose its entry from the Storybook sidebar. The editor is a development tool and is not included in AIKit's runtime exports.

## Edit a theme

- **Colors** changes brand and semantic palettes. Palette updates regenerate private shades through the Gravity generator. Brand updates connect the palette to button, selection, focus, and link tokens, and choose a contrasting button text color. Presets replace the current theme; individual colors can be edited independently for light and dark modes.
- **Typography** changes interface and monospace font families and common text sizes. Fonts must be available to your application. These settings are shared between both modes. AIKit's mobile typography overrides remain independent.
- **Radius** changes UIKit radius tokens used by inputs and attachments. The directional message bubble retains its spacing-based corners.
- **AIKit** changes user message colors, chat surfaces, mascot colors and sizes, Shimmer, and padding. An empty field inherits the existing default. Color fields also accept a simple reference such as `var(--g-color-base-brand)`.

Choose the editing variant separately from the preview mode. The preview supports light, dark, or both; desktop and mobile; and welcome, conversation, streaming, and error scenarios. You can send local sample messages, start a new chat, and open history to inspect components and portal content. No model service is contacted.

Preview CSS is restricted to the preview roots, including nested portal roots, so edits do not recolor the editor. Settings are saved in local browser storage. Use **Reset** to restore Gravity defaults, or download a theme to keep it outside the browser.

## Import and export

**Import** accepts pasted or uploaded Gravity theme CSS or JSON, as well as themes exported by this editor. CSS must use the generator's `.g-root`, `.g-root_theme_light`, and `.g-root_theme_dark` rules. Unsupported selectors or variables produce an error and leave the active theme unchanged. The source is limited to 500,000 characters.

AIKit variables are preserved separately from the Gravity generator. This includes imported `--g-aikit-*` variables without a dedicated editor control. Light-only or dark-only overrides remain specific to their mode. CSS font imports are preserved; JSON exports carry them in optional `$aikit` metadata alongside the ordinary Gravity token entries.

**Export theme** displays the generated CSS or JSON and supports copying or downloading it. JSON preserves the editable token values and references. The extended JSON includes AIKit tokens that the upstream Gravity editor does not support; use this editor to retain them when importing again. For an upstream-only theme, use the shared Gravity tokens without the AIKit entries or metadata.

Load exported CSS after the default styles:

```tsx
import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/aikit/styles';
import './aikit-theme.css';
```

Continue using UIKit's `ThemeProvider` to switch modes:

```tsx
import {ThemeProvider} from '@gravity-ui/uikit';
import {ChatContainer} from '@gravity-ui/aikit';

<ThemeProvider theme="dark">
  <ChatContainer onSendMessage={handleSendMessage} />
</ThemeProvider>;
```

AIKit's theme styles recognize UIKit's light/dark classes and retain the existing `data-theme` selectors for compatibility. A nested scoped provider can use a different mode from the surrounding application.

## Checks

```sh
npm run typecheck
npm run test:themer
npm run lint
npm run build
```

The theme exchange checks exercise the real Gravity generator and parser with independent mode overrides, palette-to-semantic references, radii, malformed imports, preview scoping, and CSS/JSON round trips. They do not render UI components.
