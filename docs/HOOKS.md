# Hooks

AIKit's public hooks are all re-exported from the package root and from the `@gravity-ui/aikit/hooks` subpath; `src/hooks/index.ts` holds the full export list.

| Hook                                                        | Purpose                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`useDateFormatter`](#usedateformatter)                     | Format chat timestamps with locale and relative-date logic                     |
| [`useToolMessage`](#usetoolmessage)                         | Tool-message state machine (expand/collapse based on status)                   |
| [`useSmartScroll`](#usesmartscroll)                         | Auto-scroll to bottom while respecting user scroll-up                          |
| [`useScrollPreservation`](#usescrollpreservation)           | Preserve scroll position when items are prepended                              |
| [`useAutoCollapseOnSuccess`](#useautocollapseonsuccess)     | Collapse a section when its async operation succeeds                           |
| [`useAutoCollapseOnCancelled`](#useautocollapseoncancelled) | Collapse a section when its async operation is cancelled                       |
| [`useFileUploadStore`](#usefileuploadstore)                 | Standalone file-upload store with progress/error states                        |
| [`useToolset`](#usetoolset)                                 | Wire a toolset into the chat: renderer registry + history merge for tool calls |
| [`useKeyboardViewportFit`](#usekeyboardviewportfit)         | Keep a container inside the area left visible by the on-screen keyboard        |

## `useDateFormatter`

Formats a single date with locale support and relative-date thresholding.

```typescript
function useDateFormatter(options: UseDateFormatterOptions): UseDateFormatterResult;

interface UseDateFormatterOptions {
  date: string | Date | number;
  format?: string; // dayjs format token; defaults to library config
}

interface UseDateFormatterResult {
  formattedDate: string; // 'Today' | 'Yesterday' | 'Mar 12, 2026'
  formattedTime: string; // '15:42'
  fullDate: string; // combined date + time
  dateObject: Dayjs | null; // parsed dayjs instance
  isValid: boolean;
  diffDays: number | null; // signed days from now (negative = past)
}
```

Powered by `dayjs`. Used inside `ChatDate`, `History`, and message components.

## `useToolMessage`

Computes display state for a tool message (expanded/collapsed, status icon, etc.).

```typescript
function useToolMessage(options: ToolMessageProps): ToolMessageState;
```

`ToolMessageProps` is defined in `src/types/tool.ts` and includes the tool's status (`'loading' | 'success' | 'error' | 'cancelled'`), title, args, result, and a `defaultExpanded` flag. The hook handles auto-collapse on success and cancellation (internally uses [`useAutoCollapseOnSuccess`](#useautocollapseonsuccess) and [`useAutoCollapseOnCancelled`](#useautocollapseoncancelled)).

## `useSmartScroll`

Keeps the scroll container pinned to the bottom while messages stream in, but yields to the user as soon as they scroll up. Used by `MessageList`.

```typescript
function useSmartScroll<T extends HTMLElement>(options?: {
  threshold?: number; // px from bottom to be "at bottom" — default 50
  enabled?: boolean;
}): {
  ref: React.RefObject<T>;
  isAtBottom: boolean;
  scrollToBottom: () => void;
};
```

## `useScrollPreservation`

Preserves a container's visual scroll position when items are prepended (typical for infinite-scroll-up message history).

```typescript
function useScrollPreservation<T extends HTMLElement>(
  deps: React.DependencyList,
): React.RefObject<T>;
```

Attach the returned ref to the scrollable container. When `deps` change (e.g. messages array grows at the top), the hook captures pre-update scroll metrics and restores them post-update.

## `useAutoCollapseOnSuccess`

Collapses a section automatically after its status transitions into a "success" state.

```typescript
function useAutoCollapseOnSuccess(options: {
  status: string;
  successStatuses: string[]; // statuses that should trigger collapse
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  delay?: number; // ms; default 0
}): void;
```

## `useAutoCollapseOnCancelled`

Same as [`useAutoCollapseOnSuccess`](#useautocollapseonsuccess) but triggered on a "cancelled" status.

```typescript
function useAutoCollapseOnCancelled(options: {
  status: string;
  cancelledStatuses: string[];
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  delay?: number;
}): void;
```

## `useFileUploadStore`

A standalone, headless store for file uploads. Tracks queued / uploading / uploaded / errored entries with progress, supports cancel and remove. Used by `FileUploadDialog` and `AttachmentPicker`, but you can use it independently to build your own upload UI.

```typescript
function useFileUploadStore<Meta = {id: string; name: string}>(
  options: UseFileUploadStoreOptions<Meta>,
): UseFileUploadStoreReturn<Meta>;

type FileUploadEntry<Meta> = {
  file: File;
  status: 'queued' | 'uploading' | 'uploaded' | 'error' | 'cancelled';
  progress: number;
  error?: unknown;
  meta?: Meta;
};

type UseFileUploadStoreReturn<Meta> = {
  files: FileUploadEntry<Meta>[];
  add: (files: File[]) => void;
  remove: (id: string) => void;
  cancel: (id: string) => void;
  clear: () => void;
  // …additional helpers
};
```

See `src/hooks/useFileUploadStore.ts` for the complete type signature.

## `useToolset`

Wires a `Toolset` into the chat: returns a `MessageRendererRegistry` whose `tool`
dispatcher renders your tool components, and a `handleToolResult` callback that
merges results into history via `applyToolResult`. It does not run model
continuation side effects; pair it with `useToolResultContinuation` when you
need to re-send the updated conversation after a tool completes.

```typescript
function useToolset<TCustom extends TMessageContent = never>(
  options: UseToolsetOptions<TCustom>,
): UseToolsetReturn;

type UseToolsetOptions<TCustom> = {
  toolset: Toolset;
  setMessages: Dispatch<SetStateAction<TChatMessage<TCustom>[]>>;
  registry?: MessageRendererRegistry;
};

type UseToolsetReturn = {
  messageRendererRegistry: MessageRendererRegistry;
  handleToolResult: (event: ToolsetResultEvent) => void;
};
```

## `useToolResultContinuation`

Observes `messages` and calls `onSettled` once when a tool part moves from a
pending status (`loading`, `waitingConfirmation`, `waitingSubmission`) to a
terminal status (`success`, `error`, `cancelled`). Tools that are already
terminal in the first observed snapshot do not fire, so replay/restore is silent
by default.

```typescript
function useToolResultContinuation<TCustom extends TMessageContent = never>(
  options: UseToolResultContinuationOptions<TCustom>,
): void;

type UseToolResultContinuationOptions<TCustom> = {
  messages: TChatMessage<TCustom>[];
  onSettled: (event: ToolSettledEvent<TCustom>) => void;
};

type ToolSettledEvent<TCustom> = {
  toolCallId: string;
  toolName: string;
  status: 'success' | 'error' | 'cancelled';
  messages: TChatMessage<TCustom>[];
};
```

See [GENUI.md](./GENUI.md) for an end-to-end example with a live model adapter.

## `useKeyboardViewportFit`

Keeps a container inside the area that the on-screen keyboard leaves visible. Browsers hold the layout viewport at full height while the keyboard is open (iOS Safari always, Chrome and Firefox since the `interactive-widget=resizes-visual` default), so `100vh` / `100dvh` / `height: 100%` keep their original value and the bottom of the container — in a chat, the prompt input — stays under the keyboard. The hook reads the visible area from `visualViewport` and returns the height limit to apply instead. Used by `ChatContainer` in mobile mode, behind its `adjustToKeyboard` prop.

The container has to be anchored to the top of the viewport: a bottom-anchored one moves its own top as soon as the returned limit shrinks it.

```typescript
function useKeyboardViewportFit(
  containerRef: RefObject<HTMLElement>, // element to fit into the visual viewport
  enabled?: boolean, // disables tracking, e.g. outside mobile mode — default true
  options?: KeyboardViewportFitOptions,
): KeyboardViewportFit;

interface KeyboardViewportFitOptions {
  // element sized to the dynamic viewport (`height: 100dvh`) used to cross-check
  // `visualViewport.height`
  viewportProbeRef?: RefObject<HTMLElement | null>;
}

interface KeyboardViewportFit {
  isKeyboardOpen: boolean; // whether the keyboard covers part of the layout viewport
  maxHeight?: number; // limit in px; undefined while the keyboard is closed
}
```

Apply `maxHeight` as the container's `max-height`; while the keyboard is closed it is `undefined` and the container keeps its natural height. Both fields follow the `resize` and `scroll` events of `visualViewport`, collapsed into a single animation frame because iOS reports intermediate sizes during the keyboard animation.

iOS Safari can report a `visualViewport.height` that is short by the height of its own bottom bar, which would shrink the container with no keyboard open at all. `viewportProbeRef` points at a hidden element sized with `height: 100dvh`, which measures the same area without that shortfall: the larger of the two readings wins as long as the difference stays below `VIEWPORT_HEIGHT_TOLERANCE`, and above it the difference is the keyboard itself and is left uncorrected. `ChatContainer` renders such a probe (`.g-aikit-chat-container__viewport-probe`) while keyboard tracking is on. The same probe also says which viewport client rectangles are measured against: pinned to the top of the layout viewport, it stays at zero where rectangles are layout-relative and drops to minus the viewport offset in Safari, where they are visual-relative.

Two constants are exported alongside the hook:

```typescript
const KEYBOARD_MIN_INSET = 80;
const VIEWPORT_HEIGHT_TOLERANCE = 100;
```

`KEYBOARD_MIN_INSET` is the smallest difference between the layout viewport and the visible area, in layout pixels, that is treated as an opened keyboard — smaller differences come from browser UI such as the URL bar and must not shrink the container. `VIEWPORT_HEIGHT_TOLERANCE` is the largest shortfall of `visualViewport.height` against the probe reading that is still attributed to the browser's own bottom chrome.

The measurement is also exported as a pure function, which takes the viewport numbers directly:

```typescript
function resolveKeyboardViewportFit(
  metrics: KeyboardViewportMetrics,
  minInset?: number, // default KEYBOARD_MIN_INSET
): KeyboardViewportFit;

interface KeyboardViewportMetrics {
  viewportHeight: number; // `visualViewport.height` — area not covered by the keyboard
  viewportOffsetTop: number; // `visualViewport.offsetTop` inside the layout viewport
  scale: number; // `visualViewport.scale`; `1` when the page is not zoomed
  layoutHeight: number; // `window.innerHeight` — keeps its height on iOS Safari
  containerTop: number; // container `getBoundingClientRect().top`
  viewportOriginTop?: number; // top of a `position: fixed; top: 0` probe — default 0
  measuredViewportHeight?: number; // height of the `height: 100dvh` probe element
}
```

`viewportOriginTop` places the origin of the layout viewport in the same coordinates the container was measured in, so the viewport offset is never added twice. `measuredViewportHeight` is the probe reading described above. Both are optional; the hook fills them in on its own.
