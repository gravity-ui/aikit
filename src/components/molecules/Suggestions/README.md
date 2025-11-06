# Suggestions

A Suggestions component displays a group of clickable suggestion buttons arranged in either horizontal (grid) or vertical (list) layout.

## Features

- **Flexible layout**: Display suggestions in grid (horizontal) or list (vertical) layout
- **Item support**: Each suggestion can have an optional ID and required title
- **Click handling**: Callback function receives both content and optional ID
- **Text alignment**: Control text alignment inside buttons (left, center, right)

## Usage

```tsx
import {Suggestions} from '@/components/molecules/Suggestions';

// With list layout (vertical)
<Suggestions
  items={[
    {id: '1', title: 'First suggestion'},
    {id: '2', title: 'Second suggestion'},
  ]}
  onClick={(content, id) => {
    console.log('Clicked:', content, id);
  }}
  layout="list"
/>

// With grid layout (horizontal)
<Suggestions
  items={[
    {id: '1', title: 'Option 1'},
    {id: '2', title: 'Option 2'},
  ]}
  onClick={(content, id) => {
    console.log('Clicked:', content, id);
  }}
  layout="grid"
/>

// With text alignment
<Suggestions
  items={[
    {id: '1', title: 'Centered text'},
    {id: '2', title: 'Another centered suggestion'},
  ]}
  textAlign="center"
  onClick={(content, id) => {
    console.log('Clicked:', content, id);
  }}
/>

// Without IDs
<Suggestions
  items={[
    {title: 'First item'},
    {title: 'Second item'},
  ]}
  onClick={(content) => {
    console.log('Clicked:', content);
  }}
/>
```

## Props

| Prop        | Type                                                      | Required | Default    | Description                                                    |
| ----------- | --------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------- |
| `items`     | `Array<{id?: string; title: string}>`                     | Yes      | -          | Array of suggestion items to display                           |
| `onClick`   | `(content: string, id?: string) => void \| Promise<void>` | Yes      | -          | Callback function called when a suggestion is clicked          |
| `layout`    | `'grid' \| 'list'`                                        | No       | `'list'`   | Layout orientation: 'grid' for horizontal, 'list' for vertical |
| `textAlign` | `'left' \| 'center' \| 'right'`                           | No       | `'center'` | Text alignment inside buttons                                  |
| `className` | `string`                                                  | No       | -          | Additional CSS class                                           |
| `qa`        | `string`                                                  | No       | -          | QA/test identifier                                             |

## Styling

The component uses CSS variables for theming and integrates with ButtonGroup for layout management.

### CSS Variables

```css
--g-spacing-2 /* Gap size between suggestion buttons */
--g-border-radius-l /* Border radius for buttons on hover */
--g-aikit-suggestions-box-shadow /* Box shadow for buttons on hover */
```

### Container

The component uses a flex container with configurable orientation based on the `layout` prop.

### Button styling

Buttons have hover effects with shadow and border radius transitions.
