# ChatDate

A ChatDate component displays formatted dates with time and locale support.

## Features

- **Multiple date formats**: Accepts string, Date object, or timestamp (number)
- **Flexible formatting**: Default format or custom dayjs format strings
- **Time display**: Time is always formatted and available separately
- **Relative dates**: Display "today", "yesterday", "two days ago", etc. with `relative` prop
- **Locale support**: Browser locale or custom locale via prop
- **Accessibility**: Semantic `<time>` element with full date in `title` attribute

## Usage

```tsx
import {ChatDate} from '@/components/atoms/ChatDate';

// Basic usage with ISO string
<ChatDate date="2024-01-15T10:30:00Z" />

// Custom format
<ChatDate date="2024-01-15T10:30:00Z" format="DD/MM/YYYY" />

// Date object
<ChatDate date={new Date(2024, 0, 15)} />

// Timestamp
<ChatDate date={1705312200000} />

// With locale
<ChatDate date="2024-01-15T10:30:00Z" locale="ru-RU" />

// With time
<ChatDate date="2024-01-15T10:30:00Z" showTime />

// With relative dates (today, yesterday, etc.)
<ChatDate date={new Date()} relative />
<ChatDate date={yesterday} relative />
```

## Props

| Prop        | Type                       | Required | Default      | Description                                         |
| ----------- | -------------------------- | -------- | ------------ | --------------------------------------------------- |
| `date`      | `string \| Date \| number` | Yes      | -            | Date value in string, Date, or number (timestamp)   |
| `showTime`  | `boolean`                  | -        | `false`      | Show time along with date                           |
| `format`    | `string`                   | -        | `YYYY.MM.DD` | Custom format string (dayjs format)                 |
| `className` | `string`                   | -        | -            | Additional CSS class                                |
| `qa`        | `string`                   | -        | -            | QA/test identifier                                  |
| `locale`    | `string`                   | -        | Browser      | Locale for date formatting (e.g., 'en-US', 'ru-RU') |
| `relative`  | `boolean`                  | -        | `false`      | Display relative dates (today, yesterday, etc.)     |

## Format Defaults

- **Default date format**: `YYYY.MM.DD` (e.g., "2024.01.15")
- **Default time format**: `HH:mm` (e.g., "10:30")
- **Custom format**: Uses dayjs format tokens (see [dayjs format documentation](https://day.js.org/docs/en/display/format))
- **Note**: Date and time are formatted separately and available as `formattedDate` and `formattedTime` from the hook

## Date Format Examples

The component accepts dates in multiple formats:

```tsx
// ISO string
<ChatDate date="2024-01-15T10:30:00Z" />

// Date object
<ChatDate date={new Date(2024, 0, 15, 10, 30)} />

// Timestamp (milliseconds)
<ChatDate date={1705312200000} />
```

## Custom Format Examples

```tsx
// European format
<ChatDate date="2024-01-15T10:30:00Z" format="DD/MM/YYYY" />
// Output: "15/01/2024"

// US format
<ChatDate date="2024-01-15T10:30:00Z" format="MM-DD-YYYY" />
// Output: "01-15-2024"

// With time
<ChatDate date="2024-01-15T10:30:00Z" format="YYYY/MM/DD HH:mm" />
// Output: "2024/01/15 10:30"
```

## Relative Dates

When the `relative` prop is enabled, the component displays relative dates for recent dates:

```tsx
// Today
<ChatDate date={new Date()} relative />
// Output: "Today"

// Yesterday
<ChatDate date={yesterday} relative />
// Output: "Yesterday"

// Two days ago
<ChatDate date={twoDaysAgo} relative />
// Output: "Two days ago"

// 3-7 days ago
<ChatDate date={threeDaysAgo} relative />
// Output: "3 days ago"

// More than a week ago - falls back to regular format
<ChatDate date={weekAgo} relative />
// Output: "2024.01.08" (regular format)
```

**Relative date rules:**

- **Today** (0 days ago): Shows "Today" (via i18n with `count: 0`)
- **Yesterday** (1 day ago): Shows "Yesterday" (via i18n with `count: 1`)
- **2-7 days ago**: Shows "N days ago" (via i18n with `count: N`)
- **More than 7 days ago**: Falls back to regular date formatting (threshold is 7 days)

When `relative` is enabled, the component uses i18n translations for relative date strings. Time is not displayed when using relative dates.

## Accessibility

The component uses semantic HTML and includes accessibility features:

- Uses `<time>` element for semantic meaning
- Includes `dateTime` attribute with ISO string
- Includes `title` attribute with full locale-aware date for tooltips
- Invalid dates return `null` (no rendering) to avoid displaying incorrect information

## Styling

The component uses CSS variables for theming:

```css
--g-color-text-secondary      /* Date text color */
--g-text-body-font-family     /* Font family */
--g-text-body-font-weight     /* Font weight */
--g-text-body-1-font-size     /* Font size */
--g-text-body-1-line-height   /* Line height */
```

The component is displayed as `inline-block` by default.

## Implementation Details

The component uses the `useDateFormatter` hook for date parsing and formatting. The hook:

- Parses dates from string, Date, or number formats
- Validates dates and returns `null` for invalid dates
- Formats dates and time separately using dayjs with custom format support
- Always formats time (available as `formattedTime` in the hook result, displayed when `showTime` is `true`)
- Generates locale-aware full date strings for accessibility
- Calculates day difference for relative date display (returns `null` if more than 7 days ago)

The component uses i18n for relative date translations with pluralization support (zero/one/other).

## Edge Cases

- Invalid date strings return `null` (component doesn't render)
- Invalid timestamps return `null`
- The component gracefully handles all date input types
