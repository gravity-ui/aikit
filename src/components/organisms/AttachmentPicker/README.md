# AttachmentPicker

A paperclip button that opens a file upload dialog.

- `uploadOnly=true` — clicking the button opens `FileUploadDialog` directly.
- `uploadOnly=false` — clicking opens a dropdown with two items: **Upload file** and **Select from storage**.

## Usage

```tsx
import {AttachmentPicker} from '@gravity-ui/aikit';

// Upload-only (e.g. image-to-text models)
<AttachmentPicker
    uploadOnly
    fileDialogProps={{
        accept: 'image/*',
        onAdd: handleFilesQueued,
        files: fileItems,
    }}
/>

// With storage selection (e.g. code interpreter)
<AttachmentPicker
    fileDialogProps={{
        onAdd: handleFilesQueued,
        files: fileItems,
    }}
    onSelectFromStorage={() => setStorageDialogOpen(true)}
/>
```

## Props

| Prop                  | Type                                               | Default | Description                                 |
| --------------------- | -------------------------------------------------- | ------- | ------------------------------------------- |
| `uploadOnly`          | `boolean`                                          | `true`  | Open dialog directly vs. show dropdown      |
| `disabled`            | `boolean`                                          | `false` | Disables the button                         |
| `fileDialogProps`     | `Omit<FileUploadDialogProps, 'open' \| 'onClose'>` | —       | Props for the upload dialog                 |
| `onSelectFromStorage` | `() => void`                                       | —       | Called when "Select from storage" is chosen |
| `buttonSize`          | `ButtonSize`                                       | `'m'`   | Button size                                 |
