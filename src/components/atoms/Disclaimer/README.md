# Disclaimer

A Disclaimer component displays informational or warning messages

## Features

- **Text display**: Show disclaimer text using Gravity UI Text component
- **Children support**: Render custom content alongside or instead of text
- **Flexible layout**: Centered flex container with configurable gap

## Usage

```tsx
import {Disclaimer} from '@/components/atoms/Disclaimer';

// With text prop
<Disclaimer text="This is a disclaimer message" />

// With custom text variant
<Disclaimer
  text="Small disclaimer"
  variant="caption-2"
/>

// With children
<Disclaimer>
  <span>Custom content</span>
</Disclaimer>

// With both text and children
<Disclaimer text="Disclaimer text">
  <span>Additional content</span>
</Disclaimer>

// With custom variant and className
<Disclaimer
  text="Important notice"
  variant="body-2"
  className="custom-disclaimer"
/>
```

## Props

| Prop        | Type                   | Required | Default    | Description                                                     |
| ----------- | ---------------------- | -------- | ---------- | --------------------------------------------------------------- |
| `text`      | `string`               | -        | -          | Disclaimer text                                                 |
| `variant`   | `TextProps['variant']` | -        | `'body-1'` | Text variant for typography styling from @gravity-ui/uikit Text |
| `children`  | `React.ReactNode`      | -        | -          | Custom content                                                  |
| `className` | `string`               | -        | -          | Additional CSS class                                            |
| `qa`        | `string`               | -        | -          | QA/test identifier                                              |

## Text Variants

The `variant` prop accepts values from Gravity UI Text component:

**Body** (font-weight: 400):

- `body-1` (13px/18px) - Default
- `body-2` (15px/20px)
- `body-3` (17px/24px)
- `body-short` (13px/16px)

**Caption** (font-weight: 400):

- `caption-1` (9px/12px)
- `caption-2` (11px/16px)

**Subheader** (font-weight: 600):

- `subheader-1` (13px/18px)
- `subheader-2` (15px/20px)
- `subheader-3` (17px/24px)

**Header** (font-weight: 600):

- `header-1` (20px/24px)
- `header-2` (24px/28px)

**Display** (font-weight: 600):

- `display-1` (28px/36px)
- `display-2` (32px/40px)
- `display-3` (40px/48px)
- `display-4` (48px/52px)

**Code** (font-weight: 400):

- `code-1` (12px/18px)
- `code-2` (14px/20px)
- `code-3` (16px/14px)
- `code-inline-1` (12px/14px)
- `code-inline-2` (14px/16px)
- `code-inline-3` (16px/20px)

**Other**:

- `inherit` - Inherits from parent

## Styling

The component uses CSS variables for theming:

### Container

```css
--g-aikit-disclaimer-gap /* Gap size for content Disclaimer */
```

The text is rendered using Gravity UI's `Text` component with `color="secondary"`.
