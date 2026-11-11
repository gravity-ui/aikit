# ActivityList

Compact progress and expandable history of reasoning, tool activity and other application-supplied steps.

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
use automatic grouping, or explicitly render `ActivityList` in your custom renderer.
Markdown configuration is forwarded. The new view starts collapsed; it does not inherit individual
legacy `defaultExpanded` or `showStatusIndicator` settings.

### Replace a custom thinking renderer

```tsx
import {ActivityList, thinkingMessageToStep} from '@gravity-ui/aikit/ActivityList';

<ActivityList
  steps={[thinkingMessageToStep(messageId, part.data)]}
  format="markdown"
  openMarkdownLinksInNewTab
/>;
```

Use a stable ID scoped to the response. One legacy message becomes one step, even when its
`content` is an array of paragraphs. Titles, contents, statuses and copy callbacks are preserved.
No category or action name is inferred from reasoning text. Without a title, details are shown directly; an empty step is represented by its status indicator.

### Supply structured steps

```tsx
import {Magnifier} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {ActivityList} from '@gravity-ui/aikit/ActivityList';

<ActivityList
  steps={[
    {id: 'analyze', type: 'reasoning', title: 'Analyzed the request', status: 'thought'},
    {id: 'search', type: 'search', title: 'Searching documentation', status: 'thinking'},
  ]}
  iconMode="type"
  stepTypes={{search: {icon: <Icon data={Magnifier} size={16} />, label: 'Documentation search'}}}
  status="thinking"
  activeStepId="search"
/>;
```

Types have no fixed enum. With `iconMode="type"`, running and completed steps keep their category icon, or a static dot when none is supplied. Error, paused and cancelled steps use their status icon instead. Category labels appear
only in the expanded history. Applications choose icons; the component does not map backend event
names to icons. Details can be omitted when the backend does not supply them.

### Configure progress presentation

```tsx
<ActivityList
  steps={steps}
  iconMode="status"
  activeStepLabel="Checking database clusters"
  format="markdown"
/>
```

The component uses `body-1` typography by default. The top-level heading uses primary text.
Step titles use primary text with the `body-1` accent weight. Descriptions, including the running
step and Markdown inside a mobile chat, use secondary text. Only the running heading pulses.
Error indicators use the danger color. Completed steps stay neutral, not green.

In expanded history, a supplied `title` is displayed above the details. Without a title, details
are displayed directly, without a repeated "In progress" or "Completed" heading. A step with
neither a title nor details displays only its status icon; when icons are hidden, a localized
status label keeps it identifiable. Status text is never substituted for a step title, and no
title is generated from content.

When `iconMode` is omitted, running and completed steps use their application-provided
category icon, falling back to a static clock or check when no icon is supplied. Existing
`stepTypes` configurations continue to work without adding a new prop.

`iconMode="status"` explicitly ignores category icons and uses a static clock while running
and a check after completion.
`iconMode="type"` uses application-provided category icons for running/completed steps,
falling back to a dot. Error, paused and cancelled states keep their dedicated status icons.
`iconMode="none"` removes icons and the timeline gutter; accessible statuses remain, and
exceptional states retain a visible status label. Custom icons can supply their own colors.
The completed group heading does not add another checkmark above the step icons.

Use `activeStepLabel` for an application-supplied plain-text heading while running. It takes
precedence over the active step title, is truncated visually and is available in full on hover.
When omitted, the active title or localized run status is used. It does not replace stored content
or affect the completed summary (`renderSummary`).

This presentation also applies automatically with `thinkingMessageView="grouped"`.
To customize icons or the running heading inside a chat, render `ActivityList` through
the existing custom thinking renderer, as in the example above.

## Props

| Prop                       | Type                                            | Required | Default                          | Description                                                        |
| -------------------------- | ----------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------------------------ |
| `steps`                    | `readonly ActivityStep[]`                       | Yes      | —                                | Accumulated, ordered steps with stable unique IDs                  |
| `iconMode`                 | `'type' \| 'status' \| 'none'`                  | No       | Category icon or status icon     | Category icons, execution-state icons, or no icons/timeline        |
| `activeStepLabel`          | `string`                                        | No       | Active title or localized status | Plain-text override of the running heading                         |
| `stepTypes`                | `Record<string, ActivityStepType>`              | No       | —                                | Category icons and labels                                          |
| `status`                   | `ActivityStepStatus`                            | No       | Last step status                 | Overall run status, independent of stored step statuses            |
| `activeStepId`             | `string`                                        | No       | Last thinking step               | Select the active step explicitly                                  |
| `expanded`                 | `boolean`                                       | No       | —                                | Controlled expansion                                               |
| `defaultExpanded`          | `boolean`                                       | No       | `false`                          | Initial uncontrolled expansion                                     |
| `maxHistoryHeight`         | `CSSProperties['maxHeight']`                    | No       | `480`                            | Maximum expanded history height; use `"none"` to disable the limit |
| `onExpandedChange`         | `(expanded: boolean) => void`                   | No       | —                                | Disclosure change callback                                         |
| `renderSummary`            | `(completedSteps: ActivityStep[]) => ReactNode` | No       | Completed count                  | Optional summary; null, false and empty string hide it             |
| `renderStepContent`        | `(step: ActivityStep) => ReactNode`             | No       | Content renderer                 | Custom details                                                     |
| `format`                   | `'plain' \| 'markdown'`                         | No       | `'plain'`                        | Content format                                                     |
| `className`, `style`, `qa` | Standard DOM/QA props                           | No       | —                                | Root customization                                                 |

Markdown options match `ThinkingMessage`: `transformOptions`, `mermaidOptions`,
`openMarkdownLinksInNewTab`, `mdxOptions`, `mdxContext`, `markdownExtraProps`.

`ActivityStep` contains `id`, `type`, `status`, optional `title`, `content`, `enabledCopy` and
`onCopyClick`. Copy is available for non-running steps; a custom callback takes precedence.
`ActivityStepStatus` is `thinking | thought | error | cancelled | paused`.
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

`ActivityList` is the new name of `ThinkingMessageGroup`. The old component and its types
remain deprecated aliases with the same implementation and props. Both root imports and
`@gravity-ui/aikit/ThinkingMessageGroup` remain supported. To migrate, replace the component
name and import path with `ActivityList`; replace `ThinkingStep`, `ThinkingStepStatus` and
`ThinkingStepType` with `ActivityStep`, `ActivityStepStatus` and `ActivityStepType`.

The status values (`thinking`, `thought`, `error`, `cancelled`, `paused`), grouping helpers
and `thinkingMessageView="grouped"` option are unchanged. `pending` and `blocked` are not
supported statuses. Activity categories remain application-defined strings, including
`reasoning`, `search` or custom tool names.

`ThinkingMessage` is deprecated in favor of this component, with removal planned for the next major
release. Its implementation, props and `ThinkingMessageContentData` remain compatible in the current
major. There are no runtime warnings and no automatic switch of the default view.

## Accessibility

Disclosure uses a keyboard-accessible UIKit button with `aria-expanded` and `aria-controls`.
History uses an ordered list, statuses have accessible labels, and copy buttons have localized labels.
Expansion is not reset on updates. `prefers-reduced-motion` disables the text pulse.

## Styling

Uses semantic Gravity UI color, spacing and typography tokens in both themes.
The existing `g-aikit-thinking-message-group` CSS classes and i18n namespace are preserved
for compatibility with integrations using the previous component name.
`--g-aikit-thinking-message-group-pulse-duration` controls the text pulse duration (default `1.5s`).
Long headings are truncated with a title tooltip; details wrap inside narrow containers.
