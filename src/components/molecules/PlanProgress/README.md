# PlanProgress

**Experimental.** The API may change or be removed in a minor release.

## Features

- Shows the overall plan status and the completed step count in a compact pill.
- Opens an accessible popup with ordered steps and status icons.
- Supports opening a step, cancelling a running plan and opening a preview through host actions.
- Shows optional elapsed labels for individual steps.

## Usage

```tsx
import {PlanProgress} from '@gravity-ui/aikit/experimental';

<PlanProgress
  status="running"
  steps={[
    {id: 'page', title: 'Build the event page', status: 'completed'},
    {id: 'form', title: 'Add the registration form', status: 'running'},
  ]}
  onStepClick={openStep}
/>;
```

## Props

| Prop            | Type                   | Description                                                                               |
| --------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| `status`        | `PlanStatus`           | Overall plan status. Accepts `pending`, `running`, `completed`, `failed` and `cancelled`. |
| `steps`         | `readonly PlanStep[]`  | Ordered list of steps with a stable ID, title and status. An empty list hides the pill.   |
| `view`          | `'pill' \| 'card'`     | Presentation. Defaults to `pill`.                                                         |
| `onCancel`      | `() => void`           | Optional cancel action on a running pill.                                                 |
| `onOpenPreview` | `() => void`           | Optional preview action on a card with completed steps.                                   |
| `onStepClick`   | `(id: string) => void` | Optional step action. The popup closes when a step is selected.                           |
| `className`     | `string`               | Additional class on the pill container.                                                   |
| `qa`            | `string`               | QA identifier.                                                                            |

`PlanStepList` accepts `steps` and `onStepClick` and renders the same list inline, for example in a plan approval card. A step can include a formatted `elapsedLabel`. Step statuses are `pending`, `running`, `completed`, `failed` and `cancelled`.

## Styling

The component uses Gravity UI spacing, radius and semantic color tokens and follows the active theme.
