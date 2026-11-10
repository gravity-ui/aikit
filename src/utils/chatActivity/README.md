# Chat activity stores

Stores for per-chat generation activity and unread responses. Components consume a common `ChatActivityStore` interface; applications choose the local request engine, the remote adapter, or their own implementation.

Import public types and factories from `@gravity-ui/aikit` or `@gravity-ui/aikit/utils`. The [integration guide](../../../docs/chat-activity.md) covers application setup and examples. This document explains the implementation.

## File responsibilities

| File                                                                                               | Responsibility                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [index.ts](./index.ts)                                                                             | Public exports for the common contracts, local factory and remote factory. The persistence helper is internal.                                                                                                                    |
| [chatActivityStore.ts](./chatActivityStore.ts)                                                     | Defines `ChatActivity`, snapshots, store interfaces and options. Creates immutable snapshots and derives aggregate activity. Implements the local request lifecycle, subscriber notifications and browser storage-event handling. |
| [chatActivityPersistence.ts](./chatActivityPersistence.ts)                                         | Implements the local storage protocol: account-scoped keys, parsing, legacy data, logically ordered request/completion records, safe compaction, response/read/deletion markers and memory fallback after storage failures.       |
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

1. `startGeneration(chatId)` reads shared request/completion records and writes a fresh request ID with the next logical sequence. Concurrent dispatches with the same sequence are ordered by their unique request IDs. The greatest request determines ownership; a completion also durably records its request, even if the earlier request write failed.
2. `responseReceived(responseId)` records that user-visible assistant text arrived. The host excludes tool output, reasoning and error notices.
3. `finish()` refreshes shared state and accepts output only if the handle still owns the chat. A completed response is persisted independently with its request's sequence and ID. The greatest completion determines the displayed response. An empty request writes no completion, so it cannot hide a response that another tab completed during dispatch.
4. `markResponseViewed(chatId, responseId)` refreshes state and acknowledges only the matching completed response. It cannot clear a newer response.
5. `deleteChat(chatId)` writes a permanent deletion marker and invalidates the local handle. Late completions stay hidden; deleted chat IDs must not be reused.

The local store's `load()` also refreshes shared state and invalidates superseded handles. Subscribed instances attach a browser `storage` listener, scoped to their account/storage; the last unsubscribe removes it. External marker updates preserve locally owned active requests. A stored request owner never restores an active flag after reload: the host must reconcile actual requests with its backend.

## Local persistence keys and concurrency

The default storage is `window.localStorage`, accessed lazily. `storage: null` uses memory. Custom storage implements `getItem`, `setItem`, `key(index)` and `length`. Providing optional `removeItem` enables compaction; adapters without it remain compatible but retain their records.

The prefix is `aikit:chat-activity:v2:<account>:`. Account, chat and response identifiers are encoded with `encodeURIComponent`; request IDs are random and unique.

| Key after the prefix          | Stored value                                 | Purpose                                                             |
| ----------------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| `request:<chat>:<request>`    | JSON `{sequence, id}`                        | Immutable request ownership record.                                 |
| `completion:<chat>:<request>` | JSON `{sequence, id, responseId, hasUnread}` | Immutable completed response, independent of a newer request.       |
| `viewed:<chat>:<response>`    | JSON `{sequence, id}`, or legacy `1`         | Acknowledgement of that exact response.                             |
| `deleted:<chat>`              | `1`                                          | Permanent tombstone preventing stale events from reviving the chat. |

Request and completion records have separate maxima, ordered by logical sequence and then request ID using code-unit string order. A completion also supplies its request ownership if persisting the initial request failed. Starting a request never copies the last response. If tab A completes between tab B reading shared state and writing its request, A's completion remains readable even when B stops without text. Acknowledging an older response cannot acknowledge a newer one.

Compaction runs during reads and mutations. It removes a completion only when a strictly greater completion has already been persisted. A request can be removed after a greater request or completion has been persisted, since a completion also records its request ownership. Thus concurrent collectors cannot remove the last durable record: a collector can remove its replacement only after an even greater durable replacement exists. Failed writes never authorize collection of durable state. Viewed markers older than the latest durable completion can be removed when they refer to a different response.

After operations settle, a live chat normally keeps one request, one completion and at most one viewed marker, regardless of its message count. Deletion first persists a tombstone and then removes the chat's other records. Late writers also run compaction; subsequent loads reclaim any remaining late records while retaining the tombstone. Tombstones are permanent because deleted chat IDs must not be reused. Other accounts and unrelated localStorage keys are untouched.

The original `aikit:chat-activity:v1:<account>` array and the previous `chat:<chat>` / `response:<chat>:<request>` format remain readable baselines. A new durable completion supersedes the old per-chat records; obsolete old response/read keys are reclaimed. The account-wide legacy array remains read-only, and tombstones continue to mask deleted legacy chats.

The helper caches values and retains failed writes in memory. Quota failures trigger compaction and one retry. Persistent failures call `onPersistenceError`; unsaved values remain available to the current instance without claiming durability. A failed replacement or tombstone cannot delete the previous durable data. This implementation coordinates same-origin browser tabs; cross-device state belongs to the server adapter.

## Server-backed state

`createRemoteChatActivityStore` uses application-provided data and callbacks. The application maps its transport model to `RemoteChatActivityState` and passes a loader, `initialState`, and/or subsequent `applySnapshot` updates from polling, push or a query cache.

- Snapshots contain complete account state. The adapter rejects another account's data, invalid revisions, and unread rows without a response ID.
- Revisions increase per account. Equal/older snapshots are ignored, regardless of whether they came from loading, push or acknowledgement.
- `load()` performs the initial load; `refresh()` explicitly reloads. Concurrent loads share the request.
- Acknowledgements are coalesced per chat/response. The marker stays until authoritative state confirms viewing. A callback can return that state directly or let a later push/query update supply it.
- Errors are exposed through snapshot `error` and optional `onError`, and async commands reject. An authoritative read confirmation suppresses a later failure for that exact pending acknowledgement, even after a newer response arrives. A later confirmation also clears its matching acknowledgement error, without clearing unrelated load/command failures. The React hook consumes rejections without an automatic retry loop.
- `deleteChat` evicts cached activity and retains a tombstone. The host deletes the actual server chat through its own API.

This adapter does not use the local persistence helper. Backend revisions and application callbacks provide its ordering and durability.

## Visibility and UI boundary

The application supplies `isPanelVisible` and the response revision actually displayed in the selected chat. `useChatActivity` additionally checks document visibility and rechecks on visibility/focus events. Opening history or merely seeing a chat row never marks an answer viewed. Stable callback wrappers invoke store methods on their owner, so class-based application stores retain their `this` receiver. History preserves row order within pin/date groups only by default when activity tracking is enabled; an explicit `preserveOrder` always takes precedence.

Keeping these concerns separate allows the same Header, History and ChatContainer components to work with local state, backend state or an application-owned store. UI behavior and storage ordering are covered by the existing tests listed above.
