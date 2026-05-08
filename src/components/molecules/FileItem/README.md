# FileItem

Displays a single file row with icon, name, optional size, upload status indicator, and remove button.

## Usage

```tsx
import {FileItem} from '@gravity-ui/aikit';

<FileItem
  name="document.pdf"
  size={102400}
  status="loading"
  mimeType="application/pdf"
  onRemove={() => handleRemove()}
/>;
```

## Props

| Prop        | Type                                | Default | Description                                    |
| ----------- | ----------------------------------- | ------- | ---------------------------------------------- |
| `name`      | `string`                            | —       | File name                                      |
| `size`      | `number`                            | —       | File size in bytes                             |
| `status`    | `'loading' \| 'success' \| 'error'` | —       | Upload status                                  |
| `mimeType`  | `string`                            | —       | MIME type for icon selection                   |
| `disabled`  | `boolean`                           | `false` | Disables remove button and applies muted style |
| `onRemove`  | `() => void`                        | —       | Called when remove button is clicked           |
| `className` | `string`                            | —       | Additional CSS class                           |
