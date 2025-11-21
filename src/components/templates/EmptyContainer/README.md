# EmptyContainer

A template component for displaying a welcome screen with image, title, description, and suggestions.

## Features

- **Welcome Screen**: Display a customizable welcome screen with image, title, and description
- **Suggestions Integration**: Built-in support for suggestion buttons to help users get started
- **Flexible Alignment**: Configure individual alignment (left/center/right) for image, title, and description
- **Show More Button**: Optional button to load additional suggestions with custom text
- **Flexible Layout**: Centered content with responsive design for various screen sizes
- **Customizable Content**: All content sections (image, title, description, suggestions) are optional

## Usage

```tsx
import {EmptyContainer} from '@gravity-ui/aikit';

// Basic usage with title and description
<EmptyContainer
  title="Welcome to AI Chat"
  description="Experience smarter, faster teamwork right inside your product!"
/>

// With suggestions
<EmptyContainer
  title="Welcome to AI Chat"
  description="Get started with AI assistance"
  suggestionTitle="Don't know where to start from? Try this:"
  suggestions={[
    {title: 'Summarize recent activity'},
    {title: 'Check code for vulnerabilities'},
    {title: 'Explain project structure'},
  ]}
  onSuggestionClick={(content) => console.log('Clicked:', content)}
/>

// Complete example with all features
<EmptyContainer
  image={<MyLogoComponent />}
  title="Welcome to AI Chat"
  description="Experience smarter, faster teamwork right inside your product!"
  suggestionTitle="Don't know where to start from? Try this:"
  suggestions={[
    {id: '1', title: 'Summarize recent activity'},
    {id: '2', title: 'Check code for vulnerabilities'},
  ]}
  onSuggestionClick={(content, id) => handleSuggestion(content, id)}
/>

// With custom alignment for content sections
<EmptyContainer
  title="Welcome to AI Chat"
  description="Get started with AI assistance"
  alignment={{
    title: 'left',
    description: 'left',
  }}
  suggestions={[
    {title: 'Summarize recent activity'},
    {title: 'Check code for vulnerabilities'},
  ]}
  onSuggestionClick={(content) => console.log('Clicked:', content)}
/>

// With show more button (text is auto-localized via i18n)
<EmptyContainer
  title="Welcome to AI Chat"
  description="Get started with AI assistance"
  suggestionTitle="Don't know where to start from? Try this:"
  suggestions={suggestions}
  onSuggestionClick={handleSuggestionClick}
  showMore={loadMoreSuggestions}
/>

// With custom show more button text
<EmptyContainer
  title="Welcome to AI Chat"
  description="Get started with AI assistance"
  suggestions={suggestions}
  onSuggestionClick={handleSuggestionClick}
  showMore={loadMoreSuggestions}
  showMoreText="Load more"
/>

// With custom React elements for title and description
<EmptyContainer
  title={
    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
      <MyIcon />
      <span>Welcome to AI Chat</span>
    </div>
  }
  description={
    <div>
      <p>Get started with AI assistance</p>
      <strong>Available 24/7</strong>
    </div>
  }
  suggestions={suggestions}
  onSuggestionClick={handleSuggestionClick}
/>

// With text wrapping for long suggestions
<EmptyContainer
  title="Welcome to AI Chat"
  description="Get started with AI assistance"
  suggestions={[
    {title: 'Can you help me understand this complex topic in simple terms?'},
    {title: 'Generate a detailed report based on the data provided'},
  ]}
  onSuggestionClick={handleSuggestionClick}
  wrapText={true}
/>
```

## Props

| Prop                | Type                                     | Required | Default | Description                                                        |
| ------------------- | ---------------------------------------- | -------- | ------- | ------------------------------------------------------------------ |
| `image`             | `ReactNode`                              | -        | -       | Image or icon to display at the top                                |
| `title`             | `string \| ReactNode`                    | -        | -       | Title text or custom React element for the welcome screen          |
| `description`       | `string \| ReactNode`                    | -        | -       | Description text or custom React element                           |
| `suggestionTitle`   | `string`                                 | -        | -       | Title for the suggestions section                                  |
| `suggestions`       | `Suggestion[]`                           | -        | `[]`    | Array of suggestion items                                          |
| `onSuggestionClick` | `(content: string, id?: string) => void` | -        | -       | Callback when a suggestion is clicked                              |
| `alignment`         | `AlignmentConfig`                        | -        | -       | Alignment configuration for image, title, and description          |
| `wrapText`          | `boolean`                                | -        | `false` | Enable text wrapping inside suggestion buttons instead of ellipsis |
| `showMore`          | `() => void`                             | -        | -       | Callback for showing more suggestions (displays a button)          |
| `showMoreText`      | `string`                                 | -        | -       | Custom text for the show more button (overrides i18n localization) |
| `className`         | `string`                                 | -        | -       | Additional CSS class                                               |
| `qa`                | `string`                                 | -        | -       | QA/test identifier                                                 |

### AlignmentConfig Type

The `alignment` prop accepts an object that allows you to configure alignment for different content sections independently:

```tsx
type ContentAlignment = 'left' | 'center' | 'right';

type AlignmentConfig = {
  image?: ContentAlignment;
  title?: ContentAlignment;
  description?: ContentAlignment;
};
```

**Default alignment**: All elements are left-aligned by default.

**Examples**:

```tsx
// Left-align all text content
<EmptyContainer
  alignment={{
    title: 'left',
    description: 'left',
  }}
/>

// Right-align title, center description
<EmptyContainer
  alignment={{
    title: 'right',
    description: 'center',
  }}
/>

// Custom alignment for all sections
<EmptyContainer
  alignment={{
    image: 'left',
    title: 'left',
    description: 'left',
  }}
/>
```

## Layout

The component is designed to take up the full height and width of its container, making it ideal for empty states or welcome screens.

The layout consists of two main areas:

1. **Content Area**: Main section containing the welcome screen elements
2. **Welcome Section**: Image, title, description, and suggestions

## Suggestions Behavior

When a suggestion is clicked, the `onSuggestionClick` callback will be called with the suggestion content and ID (if provided).

### Show More Button

When the `showMore` prop is provided, a button is displayed below the suggestions list allowing users to load additional suggestions. The button:

- Uses `flat-secondary` view from Gravity UI
- Displays an `ArrowRotateRight` icon on the left
- Text is automatically localized using Gravity UI i18n system (supports Russian and English)
- Custom text can be provided via the `showMoreText` prop to override the default localized text

**Example**:

```tsx
const [suggestions, setSuggestions] = useState(initialSuggestions);

const loadMoreSuggestions = () => {
  // Load additional suggestions
  const moreSuggestions = fetchMoreSuggestions();
  setSuggestions([...suggestions, ...moreSuggestions]);
};

<EmptyContainer
  suggestions={suggestions}
  onSuggestionClick={handleClick}
  showMore={loadMoreSuggestions}
/>;
```

## Localization

The component uses Gravity UI i18n system for localization. Currently supported languages:

- **English** (en)
- **Russian** (ru)

The localization is automatically applied based on the language configured in your Gravity UI setup.

**Localized texts:**

- Show more button text: "Show more examples" (en) / "Показать больше примеров" (ru)

To override the localized text, use the `showMoreText` prop:

```tsx
<EmptyContainer showMore={loadMore} showMoreText="Load additional items" />
```

## Styling

The component uses CSS variables for theming:

| Variable                                | Description                                                            |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `--g-aikit-empty-container-background`  | Background color of the container (default: --g-color-base-background) |
| `--g-aikit-empty-container-content-gap` | Gap between content sections (default: 48px)                           |
| `--g-aikit-empty-container-padding`     | Padding around the content area (default: 48px 32px)                   |
| `--g-spacing-2`                         | Spacing for show more button padding (default: 8px)                    |
| `--g-spacing-3`                         | Gap between suggestions elements (default: 12px)                       |
| `--g-spacing-6`                         | Gap in welcome section (default: 24px)                                 |

```css
/* Example: Custom styling */
.g-root {
  --g-aikit-empty-container-background: #f5f5f5;
  --g-aikit-empty-container-content-gap: 32px;
  --g-aikit-empty-container-padding: 24px;
}
```

```tsx
/* Example: Using the component */
<EmptyContainer title="Welcome!" description="Get started with AI" />
```

## Implementation Details

The component is built as a composition of:

- **Suggestions** molecule component for displaying suggestion buttons
- **Text** components from Gravity UI for typography

The layout uses flexbox to ensure proper vertical centering and responsive behavior. The content area is scrollable if the content exceeds the available height.
