# AgentChat

Agent chat composition with host-owned messages and configuration.

## Features

- **Host state**: No backend execution or fixture defaults.
- **Composition**: Replaceable content and controlled callbacks.
- **Compatibility**: Incremental adoption alongside existing chat components.

## Usage

```tsx
import {AgentChat} from '@gravity-ui/aikit';
```

## Props

| Prop                            | Type                | Required | Default        | Description                                                    |
| ------------------------------- | ------------------- | -------- | -------------- | -------------------------------------------------------------- |
| messages                        | TChatMessage[]      | ✓        | —              | Host-adapted messages; activity/final boundaries are explicit  |
| composer                        | ReactNode           | ✓        | —              | Host composer, usually AgentComposer                           |
| header                          | ReactNode           | —        | —              | Replace header                                                 |
| headerProps                     | HeaderProps         | —        | Code Assistant | Header presentation                                            |
| status                          | ChatStatus          | —        | —              | Host lifecycle                                                 |
| emptyContent                    | ReactNode           | —        | —              | Empty-state content                                            |
| chats, activeChat, onSelectChat | HistoryProps fields | —        | —              | Host-owned saved chats                                         |
| onCreateChat, onClose           | function            | —        | —              | Header callbacks                                               |
| ...MessageListProps             | object              | —        | —              | Render registry, actions, error/retry, timestamps and markdown |

```tsx
<AgentChat
  messages={messages}
  status={status}
  messageRendererRegistry={registry}
  composer={composer}
  userActions={copyActions}
  assistantActions={answerActions}
  showTimestamp
/>
```

`AgentComposer` requires host-provided `models`, `skills`, `repositories`, controlled `repository`/`onRepositoryChange` and `model`/`onModelChange`, plus `status`, `onSend` and `onStop`. No fixture model or repository list ships as a production default. The host may replace it entirely.

The host adapter derives file context from tool input.path and commit context from successful output.payload.hash. Supply short actions/basenames with full path tooltips via compact ToolMessage props. PR and CI context is presentation data supplied by the adapter. Never drop context on lifecycle changes. Keep final answers separate from RunActivity and keep approvals/errors requiring attention outside folded traces. User actions are copy and timestamp; assistant actions are copy final answer, regenerate, rating and timestamp as configured by the host.

The Playground story simulates a complete catalog search/category feature scenario locally, including pause/resume, previous/next step, skip, approval, recovery, cancellation and saved history. It has no backend dependency. The Standard / Agent segmented control resets playback and switches between ChatContainer and AgentChat. There is one Playground. Previous/next step reconstructs the local fixtures at a visible checkpoint and pauses there, including approval, partial streaming and the completed response. Next step can also start the scenario directly in step mode; Resume continues from the selected checkpoint. Seeking does not execute backend or Git operations.

## Styling

Uses Gravity text, background, line, spacing and radius variables. Body text uses 14px/20px, while Markdown heading hierarchy remains unchanged. Theme follows the surrounding Gravity provider.

## Explicit run boundaries

Pass `runs: AgentChatRun[]` alongside final-answer messages. Each entry associates a `RunActivityProps` object with an assistant `messageId`. AgentChat prepends that activity without classifying or removing any message parts. The host adapter must keep commentary/reasoning/tool steps in the activity and only the explicit final answer in the assistant message. Tool-call input/output and callbacks remain on the original step objects. An `agent-run` renderer is included; the host may override it through `messageRendererRegistry`.

```tsx
<AgentChat
  messages={[{id: 'assistant-1', role: 'assistant', content: finalAnswer}]}
  runs={[{messageId: 'assistant-1', activity: run}]}
  composer={composer}
/>
```

Use `historyKey` when prepending older messages. Composer's optional `modelLabel` lets the host keep a short selected-model label.

`AgentToolAttention` renders the standard ToolMessage confirmation surface outside the folded trace, with medium action buttons and an animated border. Approval remains available while playback is paused. Pass it through the run's `attention` slot.

Compose the stock `DiffStat` in compact ToolMessage's `secondaryText` for completed edits and commits. Supply numeric `added`/`deleted` values from the host and guard rendering with the successful tool state; Read rows have no change counts. Keep the filename, commit hash and file count alongside the atom. Zero counts follow DiffStat's existing behavior.

## Response-local changes lifecycle in Playground

The host tracks explicit `responseState` separately from activity/tool completion. Completed edits appear progressively in the active response's composer pill. At answer completion the pill disappears and `renderAssistantFooter` renders ChangedFilesSummary with `view="card"` for that message, after text and before actions/time. The card survives saved-history restoration and later requests. Cancellation/error retain the actual completed subset with a neutral interruption label; no synthetic success is shown. Undo/Restore and per-file previews are local, reversible fixture controls; the trace remains readable and no real Git/filesystem action runs. The Standard presentation continues to use ChatContainer.
