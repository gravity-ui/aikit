# ToolStatus

Component for displaying tool status with indicators and localized text

## Features

- **Status Indicators**: Shows visual indicators for success, error, cancelled and loading states
- **Internationalization**: Supports multiple languages (English and Russian)

## Usage

```tsx
import {ToolStatus} from '@/components/molecules/ToolStatus';

<ToolStatus status="success" />;
<ToolStatus status="error" />;
<ToolStatus status="loading" />;
<ToolStatus status="cancelled" />;
```

## Props

| Prop        | Type         | Required | Default | Description               |
| ----------- | ------------ | -------- | ------- | ------------------------- |
| `status`    | `ToolStatus` | -        | -       | Tool status to display    |
| `className` | `string`     | -        | -       | Additional CSS class name |
| `qa`        | `string`     | -        | -       | Data QA attribute         |
