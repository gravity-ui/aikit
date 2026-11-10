# ChangedFilesSummary

> **Experimental.** This API is outside AIKit's stable compatibility guarantees. It may change or be removed in minor releases without a major version bump. Patch releases preserve compatibility. Pin an exact package version and review the changelog before upgrading.

Changed-files pill or response card with aggregate DiffStat and a shared upward file-list popup.

## Features

- **Composition**: Gravity Button/Popup and the existing AIKit DiffStat.
- **Host data**: Stable file IDs, full paths and numeric baseline differences; no backend or Git logic.
- **Readable lists**: Full paths distinguish equal basenames, long paths wrap and large lists scroll.
- **Keyboard**: Enter/Space opens, Escape/outside click closes and focus returns to the trigger.
- **Optional actions**: Files are plain text unless the host provides an action.

## Usage

```tsx
import {ChangedFilesSummary} from '@gravity-ui/aikit/experimental';

<ChangedFilesSummary files={[
    {id: 'app', path: 'src/App.tsx', added: 14, deleted: 3},
    {id: 'test', path: 'tests/App.test.tsx', added: 22, deleted: 0},
]} />

<ChangedFilesSummary files={files} onFileClick={file => openFile(file.path)} />
```

The host supplies final differences per file against its chosen baseline. Aggregate numbers sum those file values, not repeated tool-call deltas. The host owns gating, active chat/run selection and whether a summary is shown. Empty lists disable the trigger. DiffStat retains its standard zero-value behavior.

## Props

| Prop         | Type                        | Required | Default       | Description                                             |
| ------------ | --------------------------- | -------- | ------------- | ------------------------------------------------------- |
| files        | readonly ChangedFile[]      | ✓        | —             | Stable id, full path, added and deleted counts          |
| label        | ReactNode                   | —        | File count    | Trigger label                                           |
| title        | string                      | —        | Changed files | Popup heading and accessible name                       |
| disabled     | boolean                     | —        | false         | Disable the trigger and hide popup                      |
| defaultOpen  | boolean                     | —        | false         | Initial uncontrolled popup state                        |
| open         | boolean                     | —        | —             | Controlled popup state                                  |
| onOpenChange | function                    | —        | —             | Requests a popup state change                           |
| onFileClick  | (file: ChangedFile) => void | —        | —             | Enables actual file actions and closes after activation |
| className    | string                      | —        | —             | Root class                                              |
| qa           | string                      | —        | —             | Root test identifier                                    |

## Pill and card views

`view="pill"` is the compatible default. Opt into `view="card"` to show an inline summary card with the same file list and statistics. The card displays Undo only when `onUndo` is provided and View changes only when `onViewChanges` is provided. The component never performs Git, filesystem or navigation operations itself. Both callbacks are disabled by `disabled` or an empty file list.

```tsx
<ChangedFilesSummary
  view="card"
  files={baselineFiles}
  onViewChanges={() => openReview(baselineFiles)}
  onUndo={() => revertLocalFixture(runId)}
/>
```

| Prop             | Type             | Required | Default      | Description                               |
| ---------------- | ---------------- | -------- | ------------ | ----------------------------------------- |
| view             | 'pill' or 'card' | —        | pill         | Presentation, without lifecycle inference |
| onViewChanges    | () => void       | —        | —            | Enables View changes on the card          |
| onUndo           | () => void       | —        | —            | Enables Undo on the card                  |
| viewChangesLabel | string           | —        | View changes | Consumer-localized action label           |
| undoLabel        | string           | —        | Undo         | Consumer-localized action label           |

The host controls lifecycle: show the pill while a response is running and actual edit results exist; after the response settles, render the card in that response's body footer before actions/time. Completion of a tool, commit or PR does not imply answer completion. Preserve completed partial changes on cancellation/error with an appropriate host label; do not label the response as successful. Fixture undo in the Playground only clears that run's simulated baseline summary and can be restored; it does not undo real files or remove the activity trace.

The multi-file card follows Gravity styling; it is not claimed to reproduce an unverified native Codex multi-file layout.

## Styling

| Variable                                   | Description                                                      |
| ------------------------------------------ | ---------------------------------------------------------------- |
| --g-aikit-changed-files-summary-width      | Popup width, default 360px                                       |
| --g-aikit-changed-files-summary-max-height | Scroll area maximum height, default 320px (also bounded by 60vh) |
| --g-color-text-primary                     | Text color                                                       |
| --g-color-base-background                  | Pill background                                                  |
| --g-color-sfx-shadow                       | Pill shadow                                                      |
| --g-color-line-focus                       | Visible keyboard focus                                           |

DiffStat supplies Gravity semantic addition/deletion colors in both themes. Place the component in normal flow within the host composer slot so its height participates in overlay measurements.
