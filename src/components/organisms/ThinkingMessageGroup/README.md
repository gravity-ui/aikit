# ThinkingMessageGroup

Compact progress and expandable reasoning history for one or more application-supplied steps.

## Features

- **Incremental adoption**: render existing thinking data without changing its public types or backend schema.
- **Controlled history**: preserve step order and identity; the application supplies accumulated data and run status.
- **Configurable categories**: pass any type and optional icon/label through `stepTypes`.
- **Text-only animation**: only the current running label pulses; icons remain static and reduced motion is respected.
- **Details and copy**: plain text, Markdown, custom content and per-step copy actions.
- **Stable expansion**: uncontrolled or controlled disclosure stays open during streaming updates.

## Usage

### Enable the new view for existing messages

```tsx
<ChatContainer
  {...chatProps}
  messageListConfig={{...messageListConfig, thinkingMessageView: 'grouped'}}
/>
```

`MessageList` and `AssistantMessage` also accept `thinkingMessageView="grouped"`.
The default remains the legacy view. Adjacent thinking parts **inside the same assistant message**
become one group. Text, tools and custom content remain in order and break groups.
An existing custom `messageRendererRegistry.thinking` takes precedence: remove that override to
use automatic grouping, or explicitly render `ThinkingMessageGroup` in your custom renderer.
Markdown configuration is forwarded. The new view starts collapsed; it does not inherit individual
legacy `defaultExpanded` or `showStatusIndicator` settings.

### Replace a custom thinking renderer

```tsx
import {ThinkingMessageGroup, thinkingMessageToStep} from '@gravity-ui/aikit/ThinkingMessageGroup';

<ThinkingMessageGroup
  steps={[thinkingMessageToStep(messageId, part.data)]}
  format="markdown"
  openMarkdownLinksInNewTab
/>;
```

Use a stable ID scoped to the response. One legacy message becomes one step, even when its
`content` is an array of paragraphs. Titles, contents, statuses and copy callbacks are preserved.
No category or action name is inferred from reasoning text. Missing titles use localized status text.

### Supply structured steps

```tsx
import {Magnifier} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {ThinkingMessageGroup} from '@gravity-ui/aikit/ThinkingMessageGroup';

<ThinkingMessageGroup
  steps={[
    {id: 'analyze', type: 'reasoning', title: 'Analyzed the request', status: 'thought'},
    {id: 'search', type: 'search', title: 'Searching documentation', status: 'thinking'},
  ]}
  stepTypes={{search: {icon: <Icon data={Magnifier} size={16} />, label: 'Documentation search'}}}
  status="thinking"
  activeStepId="search"
/>;
```

Types have no fixed enum. Running and completed steps keep their category icon, or a static dot
when none is supplied. Error, paused and cancelled steps use their status icon instead. Category labels appear
only in the expanded history. Applications choose icons; the component does not map backend event
names to icons. Details can be omitted when the backend does not supply them.

## Props

| Prop                       | Type                                            | Required | Default            | Description                                                        |
| -------------------------- | ----------------------------------------------- | -------- | ------------------ | ------------------------------------------------------------------ |
| `steps`                    | `readonly ThinkingStep[]`                       | Yes      | —                  | Accumulated, ordered steps with stable unique IDs                  |
| `stepTypes`                | `Record<string, ThinkingStepType>`              | No       | —                  | Category icons and labels                                          |
| `status`                   | `ThinkingStepStatus`                            | No       | Last step status   | Overall run status, independent of stored step statuses            |
| `activeStepId`             | `string`                                        | No       | Last thinking step | Select the active step explicitly                                  |
| `expanded`                 | `boolean`                                       | No       | —                  | Controlled expansion                                               |
| `defaultExpanded`          | `boolean`                                       | No       | `false`            | Initial uncontrolled expansion                                     |
| `maxHistoryHeight`         | `CSSProperties['maxHeight']`                    | No       | `480`              | Maximum expanded history height; use `"none"` to disable the limit |
| `onExpandedChange`         | `(expanded: boolean) => void`                   | No       | —                  | Disclosure change callback                                         |
| `renderSummary`            | `(completedSteps: ThinkingStep[]) => ReactNode` | No       | Completed count    | Optional summary; null, false and empty string hide it             |
| `renderStepContent`        | `(step: ThinkingStep) => ReactNode`             | No       | Content renderer   | Custom details                                                     |
| `format`                   | `'plain' \| 'markdown'`                         | No       | `'plain'`          | Content format                                                     |
| `className`, `style`, `qa` | Standard DOM/QA props                           | No       | —                  | Root customization                                                 |

Markdown options match `ThinkingMessage`: `transformOptions`, `mermaidOptions`,
`openMarkdownLinksInNewTab`, `mdxOptions`, `mdxContext`, `markdownExtraProps`.

`ThinkingStep` contains `id`, `type`, `status`, optional `title`, `content`, `enabledCopy` and
`onCopyClick`. Copy is available for non-running steps; a custom callback takes precedence.
`ThinkingStepStatus` is `thinking | thought | error | cancelled | paused`.
An empty group renders nothing. A single completed step remains expandable so its title is accessible.

## Group separate messages safely

`groupThinkingMessages(items, {getStep, getGroupKey})` is a pure view transformation. It returns
`{type: 'item', item, index}` entries or `{type: 'thinking-group', id, groupKey, items, steps}` entries.
It retains source objects and individual step IDs/content/statuses without merging text or mutating history.

```tsx
const entries = groupThinkingMessages(messages, {
  getStep: (message) => {
    // Only group whole messages containing exactly one thinking part.
    if (message.role !== 'assistant' || !Array.isArray(message.content)) return undefined;
    if (message.content.length !== 1 || message.content[0].type !== 'thinking') return undefined;
    if (!message.id) return undefined;
    return thinkingMessageToStep(message.id, message.content[0].data);
  },
  getGroupKey: (message) => {
    const runId = message.metadata?.runId;
    return typeof runId === 'string' ? JSON.stringify([threadId, runId]) : undefined;
  },
});
```

Supply a key that uniquely identifies a chat and response/run; use a new key for a retry.
An undefined key leaves a thinking item in its own group. Non-thinking items and key changes break
the group. Non-adjacent items are never combined. Render each group with `key={entry.id}` and
`steps={entry.steps}`. The generated ID depends on the scope and first step, so appending steps or
updating details does not remount it. Provide stable unique IDs; index fallbacks in automatic
part grouping are suitable only for append-only content arrays.

Cross-message grouping is deliberately application-controlled: AIKit cannot infer run boundaries
from adjacency or generic metadata. Streaming delta accumulation remains the adapter's job.
The component does not infer cancellation/failure from completion; pass the actual run status.

## Migration

`ThinkingMessage` is deprecated in favor of this component, with removal planned for the next major
release. Its implementation, props and `ThinkingMessageContentData` remain compatible in the current
major. There are no runtime warnings and no automatic switch of the default view.

## Accessibility

Disclosure uses a keyboard-accessible UIKit button with `aria-expanded` and `aria-controls`.
History uses an ordered list, statuses have accessible labels, and copy buttons have localized labels.
Expansion is not reset on updates. `prefers-reduced-motion` disables the text pulse.

## Styling

Uses semantic Gravity UI color, spacing and typography tokens in both themes.
`--g-aikit-thinking-message-group-pulse-duration` controls the text pulse duration (default `1.5s`).
Long headings are truncated with a title tooltip; details wrap inside narrow containers.
