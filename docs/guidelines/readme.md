# README Documentation

Every component must have a comprehensive README.md file documenting its purpose, usage, and API.

**All documentation text MUST be written in English.**

## README Structure

```markdown
# ComponentName

Brief one-line description of the component.

## Features

- **Feature 1**: Description
- **Feature 2**: Description
- **Feature 3**: Description
- (List 3-7 key features with bold titles)

## Usage

\`\`\`tsx
import {ComponentName} from '@gravity-ui/aikit';

// Basic usage example
<ComponentName
  prop1="value"
  prop2={handler}
/>

// Advanced usage example
<ComponentName
prop1="value"
prop2={handler}
prop3={true}

>   <ChildComponent />
> </ComponentName>

// Edge case example
<ComponentName
  prop1="value"
  disabled={true}
/>
\`\`\`

## Props

| Prop        | Type                | Required | Default | Description          |
| ----------- | ------------------- | -------- | ------- | -------------------- |
| `prop1`     | `string`            | ✓        | -       | Description of prop1 |
| `prop2`     | `() => void`        | ✓        | -       | Description of prop2 |
| `prop3`     | `boolean`           | -        | `false` | Description of prop3 |
| `prop4`     | `'a' \| 'b' \| 'c'` | -        | `'a'`   | Description of prop4 |
| `children`  | `ReactNode`         | -        | -       | Child components     |
| `className` | `string`            | -        | -       | Additional CSS class |
| `qa`        | `string`            | -        | -       | QA/test identifier   |

## [Additional Sections as Needed]

### States (for stateful components)

Describe different states the component can be in.

### Variants (for components with variants)

Describe visual or functional variants.

### Keyboard Support (for interactive components)

List keyboard shortcuts and interactions.

### Accessibility

Describe accessibility features and ARIA attributes.

## Styling

The component uses CSS variables for theming:

| Variable          | Description                 |
| ----------------- | --------------------------- |
| `--variable-name` | Description of CSS variable |

\`\`\`css
/_ Example of how to override _/
.custom-component {
--variable-name: custom-value;
}
\`\`\`

## Implementation Details (Optional)

Additional technical details for advanced users or contributors.
```

## README Sections Breakdown

### 1. **Component Title and Description**

- Use H1 (`#`) for the component name
- Provide a concise one-line description
- Description should explain WHAT the component is and its PRIMARY purpose

**Example**:

```markdown
# SubmitButton

A submit button component with state management through props and send/cancel icon switching.
```

### 2. **Features Section**

- Use H2 (`##`) for "Features"
- List 3-7 key features using unordered list
- **Bold** the feature name/title
- Follow with brief description
- Focus on user-facing functionality

**Example**:

```markdown
## Features

- **State Management**: Component state is controlled via a single `state` prop
- **Icon Switching**: Automatically switches between ArrowUp and Stop icons
- **Multiple Sizes**: Supports three sizes: s, m, l
- **Keyboard Support**: Full keyboard navigation support
```

### 3. **Usage Section**

- Use H2 (`##`) for "Usage"
- Provide 2-4 code examples showing:
  1. Basic/minimal usage
  2. Common usage with typical props
  3. Advanced usage with optional features
  4. Edge cases if applicable
- Use TypeScript syntax with proper typing
- Include comments explaining complex parts
- Use proper import statements

**Example**:

```markdown
## Usage

\`\`\`tsx
import {SubmitButton} from '@gravity-ui/aikit';

// Basic usage
<SubmitButton
onClick={async () => handleSubmit()}
state="enabled"
/>

// With size
<SubmitButton
onClick={async () => handleSubmit()}
state="enabled"
size="l"
/>
\`\`\`
```

### 4. **Props Section**

- Use H2 (`##`) for "Props"
- Always include a props table with columns:
  - **Prop**: Prop name in backticks (e.g., `` `propName` ``)
  - **Type**: TypeScript type in backticks
  - **Required**: ✓ for required, - for optional
  - **Default**: Default value in backticks, or `-` if none
  - **Description**: Brief description of the prop

**Formatting Rules**:

- Use `` `propName` `` for prop names
- Use `` `Type` `` for types
- Use `` `'value'` `` for string defaults
- Use `` `123` `` for number defaults
- Use `` `false` `` or `` `true` `` for boolean defaults
- Use `-` for no default
- Use `✓` for required props
- Use `\|` to escape pipe in union types: `` `'a' \| 'b'` ``

**Example**:

```markdown
## Props

| Prop        | Type                          | Required | Default | Description          |
| ----------- | ----------------------------- | -------- | ------- | -------------------- |
| `onClick`   | `() => void \| Promise<void>` | ✓        | -       | Click handler        |
| `state`     | `'enabled' \| 'disabled'`     | ✓        | -       | Button state         |
| `size`      | `'s' \| 'm' \| 'l'`           | -        | `'m'`   | Button size          |
| `className` | `string`                      | -        | -       | Additional CSS class |
| `qa`        | `string`                      | -        | -       | QA/test identifier   |
```

### 5. **Additional Content Sections** (as needed)

#### States Section (for stateful components)

```markdown
## States

The component supports the following states:

- **enabled**: Description of enabled state
- **disabled**: Description of disabled state
- **loading**: Description of loading state
```

#### Variants Section (for components with variants)

```markdown
## Variants

### Size Variants

- **s**: Small size (24px height)
- **m**: Medium size (32px height) - default
- **l**: Large size (40px height)
```

#### Keyboard Support Section

```markdown
## Keyboard Support

- `Enter` - Submit the form
- `Shift+Enter` - Create new line
- `Escape` - Clear input
```

#### Accessibility Section

```markdown
## Accessibility

The component implements the following accessibility features:

- Uses semantic `<button>` element
- Includes appropriate ARIA labels
- Supports keyboard navigation
- Announces state changes to screen readers
```

### 6. **Styling Section**

- Use H2 (`##`) for "Styling"
- Document ALL CSS variables used by the component
- Provide a table with variable names and descriptions
- Include code examples showing how to override styles

**CSS Variable Description Format**:

1. **Variable Name**: Use exact CSS variable name in backticks (`` `--variable-name` ``)
2. **Description**: Clear description of what the variable controls
3. **Use present tense**: "Color of text" not "Colors text"
4. **Be specific**: Instead of "Button color", use "Background color of button in enabled state"
5. **Include defaults if helpful**: "Border radius (default: 4px)"

**CSS Variable Categories**:

- **Colors**: Text colors, background colors, border colors
- **Spacing**: Padding, margins, gaps
- **Typography**: Font sizes, weights, line heights, font families
- **Borders**: Border radius, border widths
- **Sizes**: Width, height, icon sizes
- **Transitions**: Animation durations, timing functions

**Example**:

```markdown
## Styling

The component uses CSS variables for theming:

| Variable                    | Description                                 |
| --------------------------- | ------------------------------------------- |
| `--g-color-text-primary`    | Primary text color                          |
| `--g-color-text-secondary`  | Secondary text color (for hints and labels) |
| `--g-color-base-background` | Background color of the component           |
| `--g-color-line-generic`    | Border color                                |
| `--g-spacing-1`             | Gap between action icons (default: 8px)     |
| `--g-text-body-font-size`   | Font size for body text                     |
| `--g-text-body-line-height` | Line height for body text                   |
| `--g-border-radius-m`       | Border radius for medium-sized elements     |

\`\`\`css
/_ Example: Custom theme _/
.custom-button {
--g-color-text-primary: #007bff;
--g-color-base-background: #f8f9fa;
--g-border-radius-m: 8px;
}
\`\`\`

\`\`\`tsx
/_ Example: Inline styles _/
<ComponentName
className="custom-button"
style={{
    '--g-color-text-primary': '#007bff',
  }}
/>
\`\`\`
```

**CSS Variable Naming Patterns** (based on Gravity UI):

- `--g-color-*`: Color variables
- `--g-text-*`: Typography variables
- `--g-spacing-*`: Spacing variables
- `--g-border-*`: Border variables

**When to Document CSS Variables**:

- Document ALL CSS variables used directly in the component's styles
- Include variables from parent components if they affect this component
- Include both required and optional variables
- Group related variables together in the table

### 7. **Implementation Details Section** (Optional)

- Use H2 (`##`) for "Implementation Details"
- Include for complex components or when additional context is helpful
- Describe internal hooks, state management, or algorithms
- Reference related components or utilities

**Example**:

```markdown
## Implementation Details

The component uses the `usePromptBox` hook for state management. The hook:

- Manages textarea value and validation
- Handles keyboard shortcuts (Enter, Shift+Enter)
- Coordinates between header, body, and footer components
- Provides submit and cancel callbacks
```

## README Best Practices

1. **Language**: All text MUST be in English
2. **Clarity**: Use clear, concise language
3. **Examples**: Provide realistic, working code examples
4. **Completeness**: Document all public props and features
5. **Types**: Always include TypeScript types in prop tables
6. **Defaults**: Always specify default values for optional props
7. **Tables**: Use consistent table formatting with proper alignment
8. **Code Blocks**: Always specify language for code blocks (tsx, css, bash, etc.)
9. **Links**: Link to related documentation when helpful
10. **Updates**: Keep README in sync with component changes

## README Template Checklist

Before finalizing a README, ensure:

- [ ] Component name and one-line description are present
- [ ] Features section lists 3-7 key features
- [ ] Usage section includes 2-4 examples (basic, common, advanced)
- [ ] Props table is complete with all columns filled
- [ ] All props have proper TypeScript types
- [ ] Required vs optional props are clearly marked
- [ ] Default values are specified for optional props
- [ ] Styling section documents all CSS variables
- [ ] CSS variables have clear descriptions
- [ ] Code examples use proper TypeScript syntax
- [ ] All text is in English
- [ ] Tables are properly formatted
- [ ] Code blocks specify language
