# Chat screen navigation

## Decision

AIKit owns a small controller for a permanent `chat` root and registered secondary screens. There is no routing dependency or browser history integration. Back returns to chat; opening another secondary screen replaces the current one. Welcome and conversation are content states of the same chat screen, so sending the first message never adds a navigation entry.

The public contract and examples live in the [ChatContainer README](../src/components/pages/ChatContainer/README.md#screen-navigation). `screenTypes.ts` defines the exported types. Unlike an API that accepts custom hooks, `render` and `footer` callbacks return React nodes and can render ordinary components. Hooks stay in those components or their common consumer owner.

## Ownership and layout

| Owner                       | Responsibilities                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Consumer or adapter         | Messages, active conversation, streaming, persistence, feature flags, form state shared between slots, analytics |
| `useChatScreenNavigation`   | Availability, controlled/uncontrolled selection, leave checks, stale-result protection, notifications            |
| Internal `ChatLayout`       | Shared header/content/footer markup for welcome, conversation, and secondary screens                             |
| Persistent chat subtree     | Welcome/conversation content, prompt input, disclaimer, local UI state                                           |
| Secondary screen definition | Title, optional menu item, content, footer, leave check                                                          |

The chat subtree keeps a stable React position while hidden. Its header is removed while inactive to close its built-in menu; its input and content remain mounted. Secondary content unmounts on exit. State kept in the consumer survives until explicitly cleared. The shared layout keeps existing CSS classes, variables, and QA identifiers. Floating-header behavior remains specific to chat; secondary content uses a scrollable area below its header.

History remains a desktop popup/mobile sheet. It is not a navigation destination. Header Back and Close share the existing Header component. Secondary screens do not expose chat-only actions by default.

## Transition semantics

1. Validate the destination. Unknown/disabled destinations and requests for the current screen are ignored.
2. Run the active definition's latest `beforeLeave`. A false result or rejection leaves the screen unchanged; rejection is reported through `onScreenNavigationError`.
3. Serialize pending checks and ignore repeated requests. Built-in navigation buttons are disabled while pending.
4. Before committing, verify the request revision, source screen, mount lifetime, and target availability. External selection changes or forced fallback invalidate older requests.
5. In controlled mode emit `onScreenChange` and wait for the supplied selection. In uncontrolled mode update selection and notify.
6. On visible screen changes, close built-in transient surfaces, update chat visibility, and move focus.

| Reason        | Meaning                                                         | Example                                      |
| ------------- | --------------------------------------------------------------- | -------------------------------------------- |
| `open`        | Explicit request to open a secondary screen                     | Chat menu → instructions                     |
| `back`        | Voluntary return to the chat root                               | Instructions → chat                          |
| `unavailable` | Forced fallback from an unknown, disabled, or removed selection | Feature disabled while instructions are open |

The callback's first argument is the destination; `previousScreen` identifies the previous requested selection, including an invalid selection on fallback. Reasons are navigation metadata, not form outcomes: Save/Cancel analytics belong to the form. Close uses `onClose`, so it has no screen-change reason.

External `activeScreen` assignments are authoritative and bypass guards. Valid assignments do not echo the callback. Consumers are responsible for checking unsaved changes before external navigation or panel unmount. Unknown or disabled selections immediately display chat and notify once per invalid-selection episode; controlled consumers should reconcile their state. Forced fallback bypasses guards and does not persist discarded local form state.

## Chat lifecycle

Opening a screen must not change the input key or command reset key. Draft text, attachments, selections, and message UI survive. Streaming owners remain outside the hidden subtree, and screen changes do not cancel requests or switch conversations. Activity tracking receives panel-visible=false while chat is hidden so responses are not marked read simply because a settings screen is visible.

`ChatViewActivityContext` is internal and defaults to active for standalone components. Inactive chat disables command suggestions, message action popups, and pagination intersection callbacks. History and export dialogs close at the container boundary. Custom consumer portals require their own visibility handling.

Scroll hooks suspend writes and visibility-dependent observers while hidden. A reader's position is captured with a message anchor/offset and scroll offset. On return, an available anchor is restored; if a virtualized or removed row is unavailable, the saved scroll offset is the fallback. Follow-end intent is retained so users already following the response resume at the bottom. Conversation identity changes invalidate the saved position. This mechanism preserves screen transitions; it does not provide a persistent per-conversation scroll cache.

The layout continues to handle the mobile keyboard viewport, while prompt-specific measurements run only when chat is visible. Hidden chat content is removed from keyboard navigation and the accessibility tree via the `hidden` attribute with an explicit CSS rule. A secondary screen receives focus on its named header region, avoiding automatic mobile keyboard activation. Returning to chat restores a surviving visible initiating button or a header button fallback. No global Escape binding is added.

## Forms and examples

The Storybook instructions example demonstrates controlled state, shared footer actions, a dirty-form leave check, and availability toggling. Save and Cancel are authoritative assignments after the consumer has resolved the draft. Persistence is deliberately external; the example does not save application settings.

A production asynchronous save must retain its draft on failure and be scoped to the screen visit/request. After forced navigation or unmount, a late result must not navigate the user back from another screen. Consumers can block voluntary exit while saving. Incoming saved values must not silently replace a dirty draft. These form-specific policies remain outside the navigation controller.

## Verification

Controller tests cover replacement/Back semantics, controlled requests, disabled destinations, fallback notifications, serialized guards, rejected guards, and stale results after external changes. Integration tests exercise welcome/menu/input composition and message updates while hidden. Storybook browser scenarios cover desktop and mobile forms, cancellation of navigation, preservation of a draft after Save, welcome-to-conversation transition, and disabling the active screen.

Run browser scenarios in the standard Playwright container:

```bash
./playwright/run-docker-command.sh npx playwright test --config=test-utils/playwright.screens.config.ts
```

Existing visual regression tests also run through `npm run playwright:docker`. Type, lint, build, and behavioral checks must use each supported major's own dependency tree when evaluating backports.

## Further development

React 19.2 introduced [`Activity`](https://react.dev/reference/react/Activity), which can preserve hidden UI and clean up its effects. AIKit also supports React 18, so it currently uses explicit activity handling. Evaluate Activity after raising the minimum React version; keep streaming owners outside its boundary and verify restored scroll/focus effects.

Before adding nested navigation stacks, multiple instances of a screen, preservation of every screen in a stack, animated transitions, or swipe-back gestures, evaluate [Stackflow](https://github.com/daangn/stackflow). It provides stack navigation and a headless/plugin architecture. Prototype it against AIKit's keyboard handling, shared layout, portals, streaming, dynamic availability, and supported React versions. These integration guarantees remain AIKit's responsibility regardless of the navigation library.

If URL-addressable screens become necessary, evaluate an adapter to the consumer's router first. The controlled selection API allows that integration without introducing a nested application router into every chat instance.
