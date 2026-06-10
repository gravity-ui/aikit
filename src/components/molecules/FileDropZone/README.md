# FileDropZone

A drag-and-drop area with a hidden file input. No external dependencies — uses native HTML5 DnD.

## Usage

```tsx
import {FileDropZone} from '@gravity-ui/aikit';

<FileDropZone accept="image/*,.pdf" multiple onAdd={(files) => console.log(files)} />;
```

## Props

| Prop        | Type                      | Default                                | Description                                                  |
| ----------- | ------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| `accept`    | `string`                  | —                                      | Accepted MIME types or extensions (same as `<input accept>`) |
| `multiple`  | `boolean`                 | `true`                                 | Allow picking multiple files                                 |
| `disabled`  | `boolean`                 | `false`                                | Disables interaction                                         |
| `onAdd`     | `(files: File[]) => void` | —                                      | Called when files are dropped or picked                      |
| `label`     | `string`                  | `'Drag files here or click to upload'` | Main label text                                              |
| `hint`      | `string`                  | —                                      | Secondary hint text (e.g. accepted formats)                  |
| `className` | `string`                  | —                                      | Additional CSS class                                         |
