# FileIcon

Displays an icon representing a file based on its MIME type or file name extension.

## Usage

```tsx
import {FileIcon} from '@gravity-ui/aikit';

<FileIcon mimeType="application/pdf" size="m" />
<FileIcon fileName="report.xlsx" size="l" />
```

## Props

| Prop        | Type                | Default | Description                                            |
| ----------- | ------------------- | ------- | ------------------------------------------------------ |
| `mimeType`  | `string`            | —       | MIME type of the file (takes priority over `fileName`) |
| `fileName`  | `string`            | —       | File name used to infer the icon from the extension    |
| `size`      | `'s' \| 'm' \| 'l'` | `'m'`   | Icon size                                              |
| `className` | `string`            | —       | Additional CSS class                                   |
