# Chat activity and unread responses

AIKit supports both a local generation engine and application-provided server state. The local engine owns generation tracking, unread markers and browser persistence. With a backend, the server owns generation and unread state, and AIKit adapts its snapshots. In both modes, AIKit owns indicator priority and confirms that a specific response is actually visible before requesting an acknowledgement. `ChatContainer` connects the store to `Header`, desktop history and mobile history. Existing consumers remain unchanged until activity is configured.

## Local generation engine

```tsx
import {createChatActivityStore} from '@gravity-ui/aikit';

const activity = createChatActivityStore({accountId: authenticatedAccount.id});
activity.load();
```

Keep one stable store for the authenticated account outside the panel's lifecycle. On logout/account change, disconnect the old store and create the next account's store. The account identifier is required and becomes part of the localStorage key. Storage is accessed lazily and creation is safe during server rendering. Optionally pass `storage` implementing `getItem` and `setItem`, or `null` for memory-only usage. `onPersistenceError` reports unavailable storage, malformed data and quota failures; activity remains usable in memory.

Only completed response IDs and their unread/viewed markers are persisted. Loading history does not mark old answers unread. Active requests are never persisted: after reload, use current backend request state to resume their lifecycle. Keep the returned handles with the request objects, independently of chat selection. Call `startGeneration` only at dispatch or for a confirmed active request, never for a historical completion. Starting another generation for the same chat supersedes its previous handle.

## Report the complete request lifecycle

```tsx
const generation = activity.startGeneration(chatId);
try {
  await runRequest({
    onAssistantText: (response) => {
      updateMessages(chatId, response);
      generation.responseReceived(response.id);
    },
  });
} finally {
  generation.finish();
}
```

Start before waiting for network data. Do not stop tracking during tools, reasoning, inter-chunk pauses or a chat switch. Report `responseReceived` only for nonempty user-visible assistant text, including partial text received before cancellation/error. Tool output, reasoning, errors and cancellation notices do not count as answers. Response IDs must be stable after reload and unique across requests; if your backend reuses message IDs, supply a response revision as the identifier.

Call `finish()` on every terminal path: success, cancellation and failure. A terminal event without new text does not create an unread marker; any previous unread marker is retained. Handles ignore output and completion after finish, deletion or a superseding generation. Do not route late events through a newer handle. If the host's transport outlives the panel, it must also keep these handles alive.

## Acknowledge displayed content

```tsx
<ChatContainer
  {...chatProps}
  chatActivity={{
    store: activity,
    isPanelVisible: panelIsOpen && !panelIsCollapsed,
    renderedResponseId: displayedResponse?.id,
  }}
/>
```

`renderedResponseId` identifies the latest answer successfully displayed in `activeChat`. Omit it during chat loading or failed rendering. Update the messages and this identifier together. Use the same response revision passed to `responseReceived`. When a request completes in the visible current chat, AIKit acknowledges that exact revision after React commits it. Document visibility is checked automatically and rechecked when the browser tab becomes visible. A collapsed panel must pass `isPanelVisible: false` even if it stays mounted.

Opening history, scrolling and selecting a row do not acknowledge anything. A late acknowledgement of an older response cannot clear a newer marker. Opening one chat leaves other markers intact. A new response can mark a previously viewed chat unread again.

For custom assistant layouts, use the same `useChatActivity` hook with either store implementation:

```tsx
const snapshot = useChatActivity(activity, {
  chatId: selectedChat?.id,
  renderedResponseId: displayedResponse?.id,
  isPanelVisible: panelIsVisible,
});

<Header {...headerProps} historyActivity={snapshot} />;
<History {...historyProps} activityStore={activity} />;
```

A subscription without the second argument only observes activity; it never acknowledges responses. `Header.historyActivity` also accepts a plain `{isGenerating, hasUnread}` summary. `History` and `HistoryList` accept `activityStore`; no per-row status calculation is needed in the host.

## Server-backed state

The component contract `ChatActivityStore` contains `getSnapshot`, `subscribe`, optional `load`, `markResponseViewed` and `deleteChat`. It has no local request lifecycle methods. `createChatActivityStore` returns `LocalChatActivityStore`, which adds `startGeneration`. Components accept either implementation through the same `chatActivity.store` prop.

Use `createRemoteChatActivityStore` when the backend owns activity and read markers:

```tsx
import {createRemoteChatActivityStore} from '@gravity-ui/aikit';
import type {RemoteChatActivityState} from '@gravity-ui/aikit';

// Map the application's transport model into a full account-scoped snapshot.
const toActivityState = (data: ActivityResponse): RemoteChatActivityState => ({
  accountId: data.accountId,
  revision: data.revision,
  chats: Object.fromEntries(
    data.chats.map((chat) => [
      chat.id,
      {
        isGenerating: chat.requestActive,
        hasUnread: chat.answerUnread,
        responseId: chat.completedResponseId,
      },
    ]),
  ),
});

const activity = createRemoteChatActivityStore({
  accountId: authenticatedAccount.id,
  load: async () => toActivityState(await api.getChatActivity()),
  markResponseViewed: async (chatId, responseId) =>
    toActivityState(await api.markResponseViewed({chatId, responseId})),
  onError: ({operation, cause}) => reportActivityError(operation, cause),
});

// Push messages or polling results can use the same path as request responses.
const unsubscribe = api.subscribeToChatActivity((data) => {
  activity.applySnapshot(toActivityState(data));
});
```

Pass `activity` to `ChatContainer` exactly as in the local example. Do not call `startGeneration`, replay request events or duplicate summary calculations in this mode. AIKit computes the global spinner/unread summary from the supplied chat rows. All server snapshots contain the complete account state; an omitted chat is removed. `getSnapshot()` returns a stable immutable value until the state or request status changes, and the adapter copies incoming rows so caller mutations cannot change an already published snapshot.

The transport mapping above is application code: AIKit does not prescribe REST endpoints, request authorization or the backend's DTO shape. The application scopes loaders and subscriptions to the authenticated account, and must unsubscribe old account subscriptions on logout/switch. Create a new adapter per account. Snapshots with a different `accountId` are rejected, and a pending result in the old adapter cannot alter the new account's store.

### Revisions and acknowledgements

`revision` is a nonnegative safe integer generated by the backend, monotonically increasing per account whenever activity/read state changes. Equal or older revisions are ignored. Loading, polling, push messages and acknowledgement responses must use the same revision sequence. Do not invent a new revision from a client response's arrival order: an old network response must remain old. An unread completed response must have its own stable `responseId`; the backend must acknowledge that exact ID rather than marking the whole chat read unconditionally.

Acknowledgements for the same response are coalesced while pending. The dot stays visible until authoritative server state marks it viewed. Failures preserve the existing snapshot's activity, expose `{operation, cause, chatId?, responseId?}` through `getSnapshot().error` / `useChatActivity(...).error`, call `onError` when provided, and reject the command promise. The hook consumes those rejections and does not continuously retry a failed command on every render. Reopening the panel, returning to the browser tab or explicitly calling `markResponseViewed` can retry the visible response. Late acknowledgements cannot overwrite a newer server revision.

`load()` is an idempotent initial load and concurrent loads share a request. Optional `initialState` supplies an already loaded snapshot, including during application hydration. `refresh()` explicitly reloads/retries and exposes `isLoading`. Callers that invoke these async commands themselves must handle their rejections; component hooks already do so.

### Existing query caches and subscriptions

If the application already loads server state with a query library or external subscription, omit `load` and feed snapshots through `applySnapshot`. The acknowledgement callback may return no state when query invalidation or push will supply the confirmation later:

```tsx
const activity = createRemoteChatActivityStore({
  accountId,
  initialState: toActivityState(cachedActivity),
  markResponseViewed: async (chatId, responseId) => {
    await api.markResponseViewed({chatId, responseId});
    await queryClient.invalidateQueries({queryKey: ['chatActivity', accountId]});
  },
});

// Run when the account-scoped query result changes.
activity.applySnapshot(toActivityState(queryResult));
```

Resolving an acknowledgement callback without returning state does not optimistically clear the marker. Apply the refreshed query result or pushed confirmation. An existing application store can also implement `ChatActivityStore` directly; use `createChatActivitySnapshot(chats)` to copy its rows and calculate the common summary, then keep that snapshot stable until the underlying data changes. Its async methods should expose/report errors and reject on failure; components handle the promise lifecycle. It does not need `startGeneration` or browser storage.

## Indicators and deletion

The history button retains its clock icon and remains clickable. It displays a spinner if any request is active, otherwise a blue dot if any response is unread. Its localized accessible name and tooltip describe both states when both exist. Each row reserves space for a dot before its title and a spinner after it. Generation takes priority within a row without erasing the unread state. The dot has an accessible text alternative and tooltip. History freezes the existing chat order while its popup/sheet is open. Standalone `HistoryList` exposes `preserveOrder` for the same behavior.

Successful deletion through `History` clears the chat's activity. For deletion elsewhere, call `activity.deleteChat(chatId)` only after deletion succeeds. For local stores this removes persisted markers and invalidates the request handle. The remote adapter evicts cached state and keeps a tombstone for that ID, filtering even newer in-flight server snapshots that still contain the deleted chat. Chat IDs must not be reused within the account; remote chat deletion itself remains the host's `onDeleteChat` responsibility. In custom rendering flows, `markResponseViewed(chatId, responseId)` is available, but should only be called after that exact response becomes visible.

## Interactive example

Storybook's **pages / ChatContainer / Background Activity** provides explicit start/finish controls for two chats and a hidden-panel toggle. Start requests in both chats, finish one in the background, and open history to inspect spinner/dot priority. Complete the remaining request, then open the unread chat. Repeat with a hidden panel or background tab, stop without text, delete a generating chat, and send another response in an already viewed chat.
