# FileUploadDialog

A dialog with a drag-and-drop zone and a list of queued/uploaded files.
Pure UI — upload logic is wired externally via `useFileUploadStore`.

## Usage

```tsx
import {FileUploadDialog, useFileUploadStore} from '@gravity-ui/aikit';

const {entries, addFiles, removeFile} = useFileUploadStore({
  upload: (file) => myApi.upload(file),
});

<FileUploadDialog
  open={open}
  onClose={() => setOpen(false)}
  onAdd={addFiles}
  files={entries.map((e) => ({
    name: e.file.name,
    size: e.file.size,
    status:
      e.status === 'uploading'
        ? 'loading'
        : e.status === 'done'
          ? 'success'
          : e.status === 'error'
            ? 'error'
            : undefined,
    onRemove: () => removeFile(e.id),
  }))}
/>;
```

## Props

| Prop       | Type                                | Default          | Description                                |
| ---------- | ----------------------------------- | ---------------- | ------------------------------------------ |
| `open`     | `boolean`                           | —                | Controls dialog visibility                 |
| `onClose`  | `() => void`                        | —                | Called when dialog requests close          |
| `accept`   | `string`                            | —                | Accepted MIME types / extensions           |
| `multiple` | `boolean`                           | `true`           | Allow multiple files                       |
| `onAdd`    | `(files: File[]) => void`           | —                | Called immediately when files are selected |
| `files`    | `(FileItemProps & {id?: string})[]` | —                | File rows to display                       |
| `onApply`  | `() => void`                        | —                | If provided, shows Apply / Cancel buttons  |
| `title`    | `string`                            | `'Upload files'` | Dialog title                               |
| `disabled` | `boolean`                           | —                | Disables the drop zone                     |
