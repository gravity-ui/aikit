# RunActivity

> **Experimental.** This API is outside AIKit's stable compatibility guarantees. It may change or be removed in minor releases without a major version bump. Patch releases preserve compatibility. Pin an exact package version and review the changelog before upgrading.

Presentational ordered run history with explicit state and duration.

## Features

- **Host state**: No backend execution or fixture defaults.
- **Composition**: Replaceable content and controlled callbacks.
- **Compatibility**: Incremental adoption alongside existing chat components.

## Usage

```tsx
import {RunActivity} from '@gravity-ui/aikit/experimental';
```

## Props

| Prop             | Type                       | Required | Default | Description                                                        |
| ---------------- | -------------------------- | -------- | ------- | ------------------------------------------------------------------ |
| id               | string                     | ✓        | —       | Stable run identity                                                |
| steps            | readonly RunActivityStep[] | ✓        | —       | Ordered thinking, tool and commentary parts, each with a stable ID |
| state            | RunActivityState           | ✓        | —       | Running, completed, cancelled, error, needs-input or paused        |
| durationMs       | number                     | ✓        | —       | Host-recorded elapsed time excluding pauses                        |
| currentAction    | {label, icon}              | —        | —       | Primary action only in running summary                             |
| label            | ReactNode                  | —        | —       | Override summary                                                   |
| expanded         | boolean                    | —        | —       | Controlled disclosure                                              |
| defaultExpanded  | boolean                    | —        | false   | Initial disclosure                                                 |
| onExpandedChange | function                   | —        | —       | Disclosure callback                                                |
| renderStep       | function                   | —        | —       | Custom renderer                                                    |
| attention        | ReactNode                  | —        | —       | Always-visible approvals, questions or actionable errors           |
| showIcon         | boolean                    | —        | true    | Show summary and default step icons                                |
| className        | string                     | —        | —       | Root class                                                         |

```tsx
<RunActivity
  id={run.id}
  steps={run.steps}
  state={run.state}
  durationMs={run.durationMs}
  currentAction={run.currentAction}
  attention={run.approval}
/>
```

The host adapter must explicitly identify the activity boundary and final answer. Render the final answer separately; never infer it from the last text part or completed tool. Steps retain the host's tool identity, input/output and callbacks in `props`. This component does not execute tools, infer status or copy callback-bearing content into state. Completed duration is provided by the host, so remounts and history preserve it. Keep actionable errors and input requests in `attention`.

## Adoption

1. Use ThinkingMessage or ToolMessage with `view="compact"` alone.
2. Group those same props into RunActivity steps.
3. Adopt ChatContentV2 or AgentChat for layout.

## Styling

Uses `--g-color-text-primary`, `--g-color-text-secondary`, `--g-color-line-focus` and Shimmer's theme variables. Rows use 14px text, a fixed 20px icon container and a 24px minimum height. Buttons support Enter/Space and visible focus. Shimmer respects reduced motion.

## Icon visibility

`showIcon` defaults to `true`. Set it to `false` to hide the summary and default thinking/tool step icons, including their gutter. A step can override this through `props.showIcon`. Disclosure chevrons remain available.

```tsx
<RunActivity id="run" state="completed" durationMs={3000} steps={steps} showIcon={false} />
```
