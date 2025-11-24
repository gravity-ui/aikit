# IntersectionContainer

Wrapper component for Intersection Observer API. Used for automatic loading of previous messages when scrolling up in `MessageList`.

## Usage

```tsx
import {IntersectionContainer} from '@/components/atoms/IntersectionContainer';

<IntersectionContainer onIntersect={() => loadPreviousMessages()}>
  <Loader view="loading" />
</IntersectionContainer>;
```

## Props

| Prop          | Type                       | Required | Description                                     |
| ------------- | -------------------------- | -------- | ----------------------------------------------- |
| `children`    | `React.ReactNode`          | -        | Content to wrap                                 |
| `onIntersect` | `() => void`               | -        | Callback triggered when element enters viewport |
| `options`     | `IntersectionObserverInit` | -        | Intersection Observer options                   |
| `className`   | `string`                   | -        | Additional CSS class                            |
