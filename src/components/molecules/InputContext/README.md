# InputContext

React context provider for **prompt input attachments**: queued files, removable chips in the prompt header, and an attachment picker slot. Pairs with `useInputContext()` for consumers inside the provider tree.

## Features

- **File queue**: Wraps `useFileUploadStore` — the consumer fully controls the upload pipeline via the `fileUpload` prop
- **Header chips**: Builds `contextItems` for `PromptInputHeader` (file icon + name, remove action)
- **Footer slot**: Renders `AttachmentPicker` as `attachmentContent` for `PromptInputFooter`
- **Send preparation**: `prepareFilesForSend` splits images (base64) vs other files (`fileIds`, `fileAttachments`, `fileNames`) for API payloads
- **Reset**: Clears the queue after send or when switching chats (when integrated, e.g. `AIStudioChat`)

## Usage

```tsx
import {InputContextProvider, useInputContext} from '@gravity-ui/aikit';
import {PromptInputHeader} from '@gravity-ui/aikit';

function ChatShell() {
  return (
    <InputContextProvider
      fileUpload={{
        upload: async (file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          mimeType: file.type || undefined,
        }),
      }}
      fileDialogTitle="Attach files"
    >
      <PromptAttachmentsSection />
    </InputContextProvider>
  );
}

function PromptAttachmentsSection() {
  const {contextItems, attachmentContent, prepareFilesForSend, reset} = useInputContext();

  return (
    <>
      <PromptInputHeader contextItems={contextItems} />
      {attachmentContent}
    </>
  );
}
```

For demos and tests there is a ready-made mock pipeline exported as `mockInputContextFileUpload`:

```tsx
import {InputContextProvider, mockInputContextFileUpload} from '@gravity-ui/aikit';

<InputContextProvider fileUpload={mockInputContextFileUpload}>...</InputContextProvider>;
```

`AIStudioChat` wraps children with `InputContextProvider` automatically. Pass `fileUpload` or `fileDialogTitle` on `AIStudioChat` to customize behavior.

## Props (`InputContextProvider`)

| Prop              | Type                                          | Required | Default                | Description                               |
| ----------------- | --------------------------------------------- | -------- | ---------------------- | ----------------------------------------- |
| `children`        | `ReactNode`                                   | ✓        | -                      | Subtree that may call `useInputContext()` |
| `fileUpload`      | `UseFileUploadStoreOptions<InputContextMeta>` | ✓        | -                      | Upload pipeline for queued files          |
| `fileDialogTitle` | `string`                                      | -        | `i18n('dialog-title')` | Title of the file picker dialog           |

## `useInputContext()` return value

| Field                 | Type                                                                | Description                             |
| --------------------- | ------------------------------------------------------------------- | --------------------------------------- |
| `contextItems`        | `ContextItemConfig[]`                                               | Chips for `PromptInputHeader`           |
| `attachmentContent`   | `ReactNode`                                                         | `AttachmentPicker` for prompt footer    |
| `prepareFilesForSend` | `(inputAttachments?: File[]) => Promise<PrepareFilesForSendResult>` | Merge store + prompt files for one send |
| `reset`               | `() => void`                                                        | Clear all queued files                  |

## Styling

`InputContext` is a context provider and does not render its own visual layout. The visible chrome comes from nested components:

- File chips render via [`FileIcon`](../../atoms/FileIcon) and use the `.g-aikit-input-context__chip` BEM block (gap, alignment).
- The attachment slot is rendered by [`AttachmentPicker`](../../organisms/AttachmentPicker) — see its README for CSS variables.

| Variable        | Description                              |
| --------------- | ---------------------------------------- |
| `--g-spacing-1` | Gap between file icon and name in a chip |

```scss
// Example: override chip gap
.g-aikit-input-context__chip {
  --g-spacing-1: 6px;
}
```

## Implementation details

- Uses `useFileUploadStore` from `src/hooks/useFileUploadStore.ts`; no network calls inside the molecule beyond the injected `upload` function.
- Image files (`image/*`) are converted to base64 data URLs for multimodal payloads; non-images use upload metadata for `fileAttachments` / `fileIds`.
- Calling `useInputContext()` outside `InputContextProvider` throws a runtime error.

## Related

- [`PromptInputHeader`](../PromptInputHeader)
- [`AttachmentPicker`](../../organisms/AttachmentPicker)
- [`AIStudioChat`](../../pages/AIStudioChat/AIStudioChat.tsx)
