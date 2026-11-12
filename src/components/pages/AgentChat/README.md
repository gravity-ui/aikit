# AgentChat

Agent chat composition with host-owned messages and configuration.

> **Experimental.** This API is outside AIKit's stable compatibility guarantees. It may change or be removed in minor releases without a major version bump. Patch releases preserve compatibility. Pin an exact package version and review the changelog before upgrading.

## Features

- **Host state**: No backend execution or fixture defaults.
- **Composition**: Replaceable content and controlled callbacks.
- **Compatibility**: Incremental adoption alongside existing chat components.

## Usage

```tsx
import {AgentChat} from '@gravity-ui/aikit/experimental';
```

## Props

| Prop                            | Type                    | Required | Default        | Description                                                    |
| ------------------------------- | ----------------------- | -------- | -------------- | -------------------------------------------------------------- |
| messages                        | TChatMessage[]          | ✓        | —              | Host-adapted messages; activity/final boundaries are explicit  |
| runs                            | readonly AgentChatRun[] | —        | []             | Activity associated with assistant message IDs                 |
| historyKey                      | string or number        | —        | —              | Change with prepended history to preserve the viewport         |
| composer                        | ReactNode               | ✓        | —              | Host composer, usually AgentComposer                           |
| header                          | ReactNode               | —        | —              | Replace header                                                 |
| headerProps                     | HeaderProps             | —        | Code Assistant | Header presentation                                            |
| status                          | ChatStatus              | —        | —              | Host lifecycle                                                 |
| emptyContent                    | ReactNode               | —        | —              | Empty-state content                                            |
| chats, activeChat, onSelectChat | HistoryProps fields     | —        | —              | Host-owned saved chats                                         |
| onCreateChat, onClose           | function                | —        | —              | Header callbacks                                               |
| ...MessageListProps             | object                  | —        | —              | Render registry, actions, error/retry, timestamps and markdown |

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

## AgentComposer

`AgentComposerProps` and `AgentModelOption` are exported from `/experimental`. Models only require `id` and `name`; `description`, `icon`, `disabled`, `group` and `endContent` are optional presentation data. Adapt service-specific model metadata in the host.

```tsx
import {AgentChat, AgentComposer, type AgentModelOption} from '@gravity-ui/aikit/experimental';

const models: AgentModelOption[] = [{id: 'default', name: 'Default model'}];

<AgentChat
  messages={messages}
  runs={runs}
  composer={
    <AgentComposer
      models={models}
      model={model}
      onModelChange={setModel}
      repositories={repositories}
      repository={repository}
      onRepositoryChange={setRepository}
      skills={skills}
      status={status}
      onSend={sendMessage}
      onStop={stopRun}
      resetKey={chatId}
    />
  }
/>;
```

| Prop               | Type                                          | Required | Default             | Description                                                           |
| ------------------ | --------------------------------------------- | -------- | ------------------- | --------------------------------------------------------------------- |
| models             | AgentModelOption[]                            | ✓        | —                   | Host-localized model options                                          |
| model              | string                                        | ✓        | —                   | Controlled model ID                                                   |
| modelLabel         | string                                        | —        | Selected model name | Short trigger label                                                   |
| onModelChange      | (id: string) => void                          | ✓        | —                   | Model selection                                                       |
| repositories       | {orgSlug: string; slug: string}[]             | ✓        | —                   | Available repositories                                                |
| repository         | {orgSlug: string; repoSlug: string}           | ✓        | —                   | Controlled repository                                                 |
| onRepositoryChange | (repository) => void                          | ✓        | —                   | Repository selection                                                  |
| skills             | {slug: string; title?: string}[]              | ✓        | —                   | Available slash commands                                              |
| status             | ChatStatus                                    | ✓        | —                   | Host lifecycle                                                        |
| onSend             | (data: TSubmitData) => Promise<void or false> | ✓        | —                   | Send; rejection or false restores the draft unless newer input exists |
| onStop             | () => void                                    | ✓        | —                   | Cancel the active run                                                 |
| resetKey           | string or number                              | —        | —                   | Active conversation identity for stale draft recovery                 |

Enter sends, Shift+Enter inserts a newline, Ctrl/Cmd+Enter follows the standard prompt shortcut. IME confirmation does not send. Slash completion takes precedence only while its menu is active. Controls use the configured UIKit language.

## Clarification questions

Compose `AskUserQuestion` from the stable package entry with the experimental
AgentChat run API. Question state, answer persistence, and model execution belong
to the host; neither component automatically adds answers to the conversation.

Keep a single structured answer store keyed by tool-call ID and question ID. Each
`onAnswer` handler associates the callback with the active question, saves the
answer, and rebuilds one stable `commentary` activity step per answered question.
Include both the question text and the selected label or custom response in the
step. Updating a previous answer replaces that step. Preserve the structured
option ID for the model/tool response rather than parsing the rendered label.

For inline placement, render the pending card in `runs[].activity.attention`.
The activity summary automatically uses Shimmer in the `needs-input` state,
for both questions and approvals. Avoid repeating the waiting status inside the card.
For composer placement, render it in `composer` instead of `AgentComposer` and
leave `attention` empty. Both placements should use the same controlled answers,
drafts, index, and callbacks so switching placement does not lose progress.
Keep `activity.state` at `needs-input` while waiting. Pending cards stay outside
folded traces; answer summaries remain in `activity.steps` after the card closes.

Save each `onAnswer` result and automatically submit the collected answers and
resume the run once every required question is answered. When segmented progress
is enabled, save the final answer first and resume in `onProgressComplete`, so the
last segment can finish before the card disappears. For a single question or when
progress is omitted, resume immediately in `onAnswer`. On skip, preserve saved answers, record unanswered questions as
skipped, and submit an explicit skip result without substituting recommended options. Submit them via the provider's tool-result adapter,
restore the composer, and keep the accumulated answer steps in the run history.
Stream the final response in the assistant message, separately from activity.
Adding visible activity steps does not itself submit answers to the model.

`onQuestionChange` is navigation, not submission. `onClose` does not choose an
answer. The Clarification Question demo records unanswered questions as skipped;
production callers must send an explicit skip/cancel result through their adapter.

See [AskUserQuestion](../../organisms/AskUserQuestion/README.md#answers-and-conversation-history)
for callback payloads, answer-step code, and the multi-question lifecycle. The
**Clarification Question** story demonstrates both placements, one or three
questions, draft preservation, and continuation after all answers. Its answer
history is built by the story's host simulation, not by `AskUserQuestion` itself.
