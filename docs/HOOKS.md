# Hooks

AIKit exports 8 public hooks. All are re-exported from the package root and from the `@gravity-ui/aikit/hooks` subpath.

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
merges results into history via `applyToolResult` and forwards the updated
transcript to `onAfterResult` (typical use: re-sending the conversation to the
model). The callback is deferred to a microtask so it never fires inside a React
reducer pass.

```typescript
function useToolset<TCustom extends TMessageContent = never>(
  options: UseToolsetOptions<TCustom>,
): UseToolsetReturn;

type UseToolsetOptions<TCustom> = {
  toolset: Toolset;
  setMessages: Dispatch<SetStateAction<TChatMessage<TCustom>[]>>;
  onAfterResult?: (messages: TChatMessage<TCustom>[]) => void;
  registry?: MessageRendererRegistry;
};

type UseToolsetReturn = {
  messageRendererRegistry: MessageRendererRegistry;
  handleToolResult: (event: ToolsetResultEvent) => void;
};
```

See [GENUI.md](./GENUI.md) for an end-to-end example with a live model adapter.
