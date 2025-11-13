# Tabs

Tabs component for switching between sections with optional delete functionality. Built on top of Gravity UI's Label component.

## Features

- **Tab Selection**: Click to switch between tabs with active state indication
- **Icon Support**: Display icons alongside tab titles
- **Delete Functionality**: Optional delete button with async callback
- **Horizontal Scroll**: Automatically scrolls when tabs overflow with hover-visible scrollbar
- **Theming**: Uses Gravity UI's Label component themes (info for active, clear for inactive)
- **Responsive**: Shrinks tabs as needed, maintains readability

## Usage

```tsx
import {Tabs} from '@/components/molecules/Tabs';
import {Icon} from '@gravity-ui/uikit';
import {ChatIcon} from '@gravity-ui/icons';

// Basic tabs
<Tabs
  items={[
    {id: '1', title: 'Chat name 1'},
    {id: '2', title: 'Chat name 2'},
    {id: '3', title: 'Chat name 3'},
  ]}
  activeId="1"
  onSelectItem={(id) => console.log('Selected:', id)}
/>

// Tabs with icons
<Tabs
  items={[
    {id: '1', title: 'Chat name 1', icon: <Icon data={ChatIcon} size={16} />},
    {id: '2', title: 'Chat name 2', icon: <Icon data={ChatIcon} size={16} />},
  ]}
  activeId="1"
  onSelectItem={(id) => console.log('Selected:', id)}
/>

// Tabs with delete functionality
<Tabs
  items={[
    {id: '1', title: 'Chat name 1'},
    {id: '2', title: 'Chat name 2'},
  ]}
  activeId="1"
  onSelectItem={(id) => console.log('Selected:', id)}
  onDeleteItem={async (id) => {
    await deleteTab(id);
  }}
  allowDelete={true}
/>

// Tabs with custom styling
<Tabs
  items={basicItems}
  activeId="1"
  allowDelete={true}
  style={{
    '--g-color-base-info-light': '#ff9100',
    '--g-color-base-info-light-hover': '#aa9100',
    '--g-color-text-info-heavy': '#ffffff',
  }}
/>
```

## Props

| Prop           | Type                                                          | Required | Default | Description                               |
| -------------- | ------------------------------------------------------------- | -------- | ------- | ----------------------------------------- |
| `items`        | `Array<{id: string; title: string; icon?: React.ReactNode;}>` | ✓        | -       | Array of tab items to display             |
| `activeId`     | `string`                                                      | -        | -       | ID of the currently active tab            |
| `onSelectItem` | `(id: string) => void`                                        | -        | -       | Callback when a tab is clicked            |
| `onDeleteItem` | `(id: string) => Promise<void>`                               | -        | -       | Async callback when delete button clicked |
| `allowDelete`  | `boolean`                                                     | -        | false   | Whether to show delete buttons on tabs    |
| `className`    | `string`                                                      | -        | -       | Additional CSS class                      |
| `style`        | `React.CSSProperties`                                         | -        | -       | Inline styles (can include CSS variables) |
| `qa`           | `string`                                                      | -        | -       | QA attribute for testing                  |

## Styling

The component uses CSS variables for theming. Since it's built on Gravity UI's Label component, you can customize the active tab appearance using Label theme variables:

### Spacing

```css
--g-spacing-1 /* Vertical padding */
--g-spacing-2 /* Gap between tabs */
```

### Active Tab (theme="info")

```css
--g-color-base-info-light /* Active tab background */
--g-color-base-info-light-hover /* Active tab background on hover */
--g-color-text-info-heavy /* Active tab text color */
--g-color-base-simple-hover /* Close button hover background */
```

### Inactive Tab (theme="clear")

```css
--g-color-text-complementary /* Inactive tab text color */
--g-color-line-generic /* Inactive tab border */
```

### Scrollbar

```css
--g-color-base-generic-medium /* Scrollbar color (visible on hover) */
```

## Behavior

- **Scrollbar**: Hidden by default, appears on hover for better UX
- **Overflow**: Tabs scroll horizontally when they don't fit in the container
- **Tab Width**: Tabs shrink to fit content but don't wrap text
- **Delete Action**: Async, allowing for server-side operations before removal
