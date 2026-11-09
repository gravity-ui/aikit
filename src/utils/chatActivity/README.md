# Chat activity stores

Stores for per-chat generation activity and unread responses. Components consume a common `ChatActivityStore` interface; applications choose the local request engine, the remote adapter, or their own implementation.

Import public types and factories from `@gravity-ui/aikit` or `@gravity-ui/aikit/utils`. The [integration guide](../../../docs/chat-activity.md) covers application setup and examples. This document explains the implementation.

## File responsibilities

| File                                                                                               | Responsibility                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [index.ts](./index.ts)                                                                             | Public exports for the common contracts, local factory and remote factory. The persistence helper is internal.                                                                                                                    |
| [chatActivityStore.ts](./chatActivityStore.ts)                                                     | Defines `ChatActivity`, snapshots, store interfaces and options. Creates immutable snapshots and derives aggregate activity. Implements the local request lifecycle, subscriber notifications and browser storage-event handling. |
| [chatActivityPersistence.ts](./chatActivityPersistence.ts)                                         | Implements the local storage protocol: account-scoped keys, parsing, legacy data, request ownership, response/read/deletion records and memory fallback after storage failures.                                                   |
| [remoteChatActivityStore.ts](./remoteChatActivityStore.ts)                                         | Adapts complete backend snapshots. Validates account/revision, orders incoming state, coalesces loads and acknowledgements, reports failures and filters deleted chats.                                                           |
| [**tests**/chatActivityStore.unit.test.ts](./__tests__/chatActivityStore.unit.test.ts)             | Covers local lifecycle, reload, account isolation, concurrent writes, exact-response reads, deletion, legacy data and storage events.                                                                                             |
| [**tests**/remoteChatActivityStore.unit.test.ts](./__tests__/remoteChatActivityStore.unit.test.ts) | Covers server revisions, load/acknowledgement races, deduplication, retries, deletion and account validation.                                                                                                                     |

Related code remains in its owning layer:

| File                                                                                               | Responsibility                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [useChatActivity.ts](../../hooks/useChatActivity.ts)                                               | Connects the store to React with `useSyncExternalStore`. Loads initial data and requests acknowledgement only when the exact response has rendered in a visible panel and browser tab. |
| [useChatActivity.integration.unit.test.tsx](../../hooks/useChatActivity.integration.unit.test.tsx) | Verifies rendering/visibility-driven acknowledgements, async failures, retry on reopening and account switching.                                                                       |
| [ChatContainer.tsx](../../components/pages/ChatContainer/ChatContainer.tsx)                        | Supplies active chat, displayed response and host panel visibility to the hook; passes activity to Header and History.                                                                 |
| [Header.tsx](../../components/organisms/Header/Header.tsx)                                         | Renders the aggregate history-button indicator and localized accessible label.                                                                                                         |
| [HistoryList.tsx](../../components/templates/History/HistoryList.tsx)                              | Subscribes without acknowledging answers and clears activity after successful chat deletion.                                                                                           |
| [ChatItem.tsx](../../components/templates/History/ChatItem.tsx)                                    | Renders the indicator of one chat.                                                                                                                                                     |

## Common contract and derived state

`ChatActivityStore` exposes `getSnapshot`, `subscribe`, optional `load`, `markResponseViewed` and `deleteChat`. A snapshot contains per-chat `isGenerating`, `hasUnread` and optional completed `responseId`, plus aggregate flags. Async stores can also expose loading/error state.

`createChatActivitySnapshot` copies and freezes rows and computes the aggregate flags with an OR over all chats. Both flags can be true: renderers give generation priority while preserving the unread state. The store does not choose icons or localized strings.

Consumers keep a stable store instance per account. `getSnapshot` returns the cached immutable snapshot; changes publish a new snapshot and notify subscribers. Request methods belong to `LocalChatActivityStore`, so a server-backed implementation does not have to implement a local generation engine.

## Local request lifecycle

`createChatActivityStore` delegates persistence to `createChatActivityPersistence` and keeps active request handles in memory.

1. `startGeneration(chatId)` reads current shared state and assigns a fresh request owner. It records the previously completed response as a fallback, then marks the new handle active in this instance.
2. `responseReceived(responseId)` records that user-visible assistant text arrived. The host excludes tool output, reasoning and error notices.
3. `finish()` refreshes shared state and accepts output only if the handle still owns the chat. A completed response is persisted under that request's own key. Finishing without text preserves the previous response and its read state.
4. `markResponseViewed(chatId, responseId)` refreshes state and acknowledges only the matching completed response. It cannot clear a newer response.
5. `deleteChat(chatId)` writes a permanent deletion marker and invalidates the local handle. Late completions stay hidden; deleted chat IDs must not be reused.

The local store's `load()` also refreshes shared state and invalidates superseded handles. Subscribed instances attach a browser `storage` listener, scoped to their account/storage; the last unsubscribe removes it. External marker updates preserve locally owned active requests. A stored request owner never restores an active flag after reload: the host must reconcile actual requests with its backend.

## Local persistence keys and concurrency

The default storage is `window.localStorage`, accessed lazily. `storage: null` uses memory. Custom storage implements `getItem`, `setItem`, `key(index)` and `length` so a new instance can discover stored chats.

The prefix is `aikit:chat-activity:v2:<account>:`. Account, chat and response identifiers are encoded with `encodeURIComponent`; request IDs are generated by the local store.

| Key after the prefix        | Stored value            | Purpose                                                                      |
| --------------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| `chat:<chat>`               | JSON `{id, previous?}`  | Current request owner and the previously completed response's ID/read state. |
| `response:<chat>:<request>` | JSON response-ID string | Completion belonging to that particular request.                             |
| `viewed:<chat>:<response>`  | `1`                     | Monotonic acknowledgement of one response.                                   |
| `deleted:<chat>`            | `1`                     | Permanent tombstone preventing stale events from reviving the chat.          |

Operations read current shared values and update their own keys. They never write an account-wide snapshot. This prevents a stale tab changing chat B from erasing chat A's markers. Completion and acknowledgement have separate keys, so acknowledging an older response cannot overwrite a new completion. Even if an old handle writes after deletion or a new dispatch, reading the current owner/tombstone prevents that output from becoming current.

The old `aikit:chat-activity:v1:<account>` array remains a read-only baseline. New chat records and tombstones override it; viewed markers apply to the exact response ID. Loading legacy data does not mark historical replies unread or rewrite the old array.

The persistence helper caches values and retains failed writes in memory. Failures call `onPersistenceError`; those unsaved values are available to the current instance without claiming successful durable storage. This local implementation coordinates same-origin browser tabs. Cross-device state belongs to the server adapter.

## Server-backed state

`createRemoteChatActivityStore` uses application-provided data and callbacks. The application maps its transport model to `RemoteChatActivityState` and passes a loader, `initialState`, and/or subsequent `applySnapshot` updates from polling, push or a query cache.

- Snapshots contain complete account state. The adapter rejects another account's data, invalid revisions, and unread rows without a response ID.
- Revisions increase per account. Equal/older snapshots are ignored, regardless of whether they came from loading, push or acknowledgement.
- `load()` performs the initial load; `refresh()` explicitly reloads. Concurrent loads share the request.
- Acknowledgements are coalesced per chat/response. The marker stays until authoritative state confirms viewing. A callback can return that state directly or let a later push/query update supply it.
- Errors are exposed through snapshot `error` and optional `onError`, and async commands reject. The React hook consumes rejections without an automatic retry loop.
- `deleteChat` evicts cached activity and retains a tombstone. The host deletes the actual server chat through its own API.

This adapter does not use the local persistence helper. Backend revisions and application callbacks provide its ordering and durability.

## Visibility and UI boundary

The application supplies `isPanelVisible` and the response revision actually displayed in the selected chat. `useChatActivity` additionally checks document visibility and rechecks on visibility/focus events. Opening history or merely seeing a chat row never marks an answer viewed.

Keeping these concerns separate allows the same Header, History and ChatContainer components to work with local state, backend state or an application-owned store. UI behavior and storage ordering are covered by the existing tests listed above.
