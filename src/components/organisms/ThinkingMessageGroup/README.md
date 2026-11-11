# ThinkingMessageGroup

Compatibility alias for the [ActivityList](../ActivityList/README.md) component.

> Deprecated: use `ActivityList`. Existing imports and props remain supported; removal requires a future major release.

## Features

- **Same implementation**: `ThinkingMessageGroup === ActivityList`; no wrapper or duplicate rendering logic.
- **Compatible imports**: both the package root and `@gravity-ui/aikit/ThinkingMessageGroup` remain available.
- **Gradual migration**: existing props, status values, helpers and styles continue to work.

## Usage

Existing code remains valid:

```tsx
import {ThinkingMessageGroup} from '@gravity-ui/aikit/ThinkingMessageGroup';

<ThinkingMessageGroup steps={steps} />;
```

For new code, or when migrating, change the import and component name:

```tsx
import {ActivityList} from '@gravity-ui/aikit/ActivityList';

<ActivityList steps={steps} />;
```

## Props

All props are identical to [ActivityList props](../ActivityList/README.md#props).
The deprecated `ThinkingMessageGroupProps`, `ThinkingStep`, `ThinkingStepStatus` and
`ThinkingStepType` types alias `ActivityListProps`, `ActivityStep`, `ActivityStepStatus` and
`ActivityStepType`, respectively. The new types are exported from the package root and
`@gravity-ui/aikit/ActivityList`.

`thinkingMessageToStep`, `groupThinkingMessages`, `ThinkingGroupEntry` and
`GroupThinkingMessagesOptions` keep their names and remain available from both subpaths.

## Styling

CSS classes and the `--g-aikit-thinking-message-group-pulse-duration` custom property are
preserved. See [ActivityList styling](../ActivityList/README.md#styling).
