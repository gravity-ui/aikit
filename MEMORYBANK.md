# Memory Bank - AIKit Component Development Guidelines

This document contains guidelines and patterns for developing components in the AIKit project.

## Table of Contents

1. [Storybook Files Creation](#storybook-files-creation)
2. [Testing Guidelines](#testing-guidelines)
3. [README Documentation](#readme-documentation)

---

## Storybook Files Creation

All components should have Storybook stories for documentation and testing purposes. Stories are located in the `__stories__` directory within each component folder.

### Directory Structure

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.scss
├── README.md
├── index.ts
└── __stories__/
    ├── Docs.mdx
    └── ComponentName.stories.tsx
```

### 1. Docs.mdx Template

**Location**: `ComponentName/__stories__/Docs.mdx`

**Standard Template**:

```mdx
import {Meta, Canvas, Controls, Markdown} from '@storybook/addon-docs';
import * as Stories from './ComponentName.stories';
import Readme from '../README.md?raw';

<Meta of={Stories} />

<Markdown>{Readme}</Markdown>

## Playground

<Canvas of={Stories.Playground} />
<Controls of={Stories.Playground} />
```

**Key Points**:

- Always import `Meta`, `Canvas`, `Controls`, and `Markdown` from `@storybook/addon-docs`
- Import all stories as `* as Stories` from the corresponding `.stories.tsx` file
- Import the component's README using `?raw` suffix
- Use `<Meta of={Stories} />` to link to the stories metadata
- Use `<Markdown>{Readme}</Markdown>` to render the README content
- Include a Playground section with `<Canvas>` and `<Controls>` components
- The Playground story should always be the first/default story for interactive testing

### 2. Stories File Template

**Location**: `ComponentName/__stories__/ComponentName.stories.tsx`

**Standard Structure**:

```tsx
import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {ComponentName} from '..';
import {ContentWrapper} from '../../../demo/ContentWrapper';
import MDXDocs from './Docs.mdx';

export default {
  title: 'category/ComponentName',
  component: ComponentName,
  parameters: {
    docs: {
      page: MDXDocs,
    },
  },
} as Meta;

type Story = StoryObj<typeof ComponentName>;

const defaultDecorators = [
  (Story) => (
    <ContentWrapper>
      <Story />
    </ContentWrapper>
  ),
] satisfies Story['decorators'];

export const Playground: Story = {
  args: {
    // Default props for interactive testing
  },
  decorators: defaultDecorators,
};

// Additional stories...
```

**Story Categories**:

- `atoms/ComponentName` - Atomic components (buttons, inputs, indicators)
- `molecules/ComponentName` - Molecule components (composed atoms)
- `organisms/ComponentName` - Organism components (complex UI sections)
- `pages/ComponentName` - Page-level components
- `templates/ComponentName` - Template components

**Story Types to Include**:

1. **Playground** (Required) - Interactive story with controls

   ```tsx
   export const Playground: Story = {
     args: {
       // All configurable props
     },
     decorators: defaultDecorators,
   };
   ```

2. **Default State** - Component in its default state

   ```tsx
   export const Default: Story = {
     args: {
       // Minimal required props
     },
     decorators: defaultDecorators,
   };
   ```

3. **With State** - Stories demonstrating stateful behavior

   ```tsx
   export const WithValue: Story = {
     render: (args) => {
       const [value, setValue] = useState('initial value');
       return <ComponentName {...args} value={value} onChange={setValue} />;
     },
     decorators: defaultDecorators,
   };
   ```

4. **Variants** - Different visual or functional variants

   ```tsx
   export const LargeSize: Story = {
     args: {
       size: 'l',
     },
     decorators: defaultDecorators,
   };
   ```

5. **Edge Cases** - Disabled, loading, error states

   ```tsx
   export const Disabled: Story = {
     args: {
       disabled: true,
     },
     decorators: defaultDecorators,
   };
   ```

6. **Complex Examples** - Real-world usage scenarios
   ```tsx
   export const WithCustomContent: Story = {
     args: {
       children: <CustomComponent />,
     },
     decorators: defaultDecorators,
   };
   ```

**Decorator Guidelines**:

- Use `ContentWrapper` from `demo/ContentWrapper` to constrain component width when needed
- Set explicit width only if the component has specific display requirements:
  - Content wrapping/line breaks behavior
  - Grid layout that needs specific dimensions
  - Component designed for modals or popups
- Use `satisfies Story['decorators']` for type safety
- Create `defaultDecorators` constant for reusability

**Best Practices**:

- Always include a `Playground` story as the first exported story
- Use descriptive story names that explain the use case
- Group related stories logically
- Include comments explaining complex story logic
- Use `render` function for stories requiring state or complex logic
- Use `args` for simple prop variations
- Test all major props and their combinations
- Include accessibility considerations in stories

---

## Testing Guidelines

Tests should be created based on Storybook stories to ensure consistency between documentation and functionality. We use **Playwright Component Testing** for visual regression testing and interaction testing.

### Test File Structure

**Location**: `ComponentName/__tests__/` directory with the following files:

- `helpersPlaywright.tsx` - exports composed stories
- `ComponentName.visual.spec.tsx` - Playwright test file
- `__snapshots__/` - directory for visual regression snapshots

**Helper File Template** (`helpersPlaywright.tsx`):

```tsx
import {composeStories} from '@storybook/react';

import * as DefaultComponentNameStories from '../__stories__/ComponentName.stories';

export const ComponentNameStories = composeStories(DefaultComponentNameStories);
```

**Test File Template** (`ComponentName.visual.spec.tsx`):

```tsx
import React from 'react';

import {test} from '~playwright/core';

import {ComponentNameStories} from './helpersPlaywright';

test.describe('ComponentName', {tag: '@ComponentName'}, () => {
  test('should render playground state', async ({mount, expectScreenshot}) => {
    await mount(<ComponentNameStories.Playground />);

    await expectScreenshot();
  });

  test('should render default state', async ({mount, expectScreenshot}) => {
    await mount(<ComponentNameStories.Default />);

    await expectScreenshot();
  });

  // More tests for each story
});
```

### Testing Rules Based on Stories

1. **One Test Per Story**
   - Create a separate `test()` for each exported story
   - Name it descriptively: `test('should render [story name] state', async () => {})`
   - This ensures clear mapping between stories and tests

2. **Visual Regression Testing**

   Every story should have a visual regression test:

   ```tsx
   test('should render playground state', async ({mount, expectScreenshot}) => {
     await mount(<ComponentNameStories.Playground />);

     await expectScreenshot();
   });
   ```

3. **Interaction Testing**

   Test user interactions like clicks, hovers, and input:

   ```tsx
   test('should handle button click', async ({mount, page}) => {
     await mount(<ComponentNameStories.WithButton />);

     const button = page.getByRole('button', {name: 'Click me'});
     await button.click();

     // Verify the result
     await page.getByText('Clicked!').waitFor();
   });
   ```

4. **Hover States and Tooltips**

   ```tsx
   test('should show tooltip on hover', async ({mount, page, expectScreenshot}) => {
     await mount(<ComponentNameStories.WithTooltip />);

     await page.locator('.element').hover();
     await page.waitForTimeout(500); // Wait for tooltip to appear

     await expectScreenshot();
   });
   ```

5. **Async Behavior Testing**

   For components with async operations:

   ```tsx
   test('should handle async operation', async ({mount, page}) => {
     await mount(<ComponentNameStories.WithAsync />);

     await page.getByRole('button').click();

     // Wait for async operation to complete
     await page.getByText('Loaded!').waitFor();
   });
   ```

6. **Test Coverage Requirements**
   - Every exported story should have at least one test
   - Include visual regression tests for all visual states
   - Include interaction tests for interactive components
   - Test edge cases (disabled, loading, error states)
   - Test different viewport sizes if responsive behavior is important

7. **Test Naming Conventions**
   - Use descriptive test names: `test('should [expected behavior]', async () => {})`
   - Examples:
     - `test('should render enabled state', async () => {})`
     - `test('should display all suggestions', async () => {})`
     - `test('should handle suggestion click', async () => {})`

8. **Using Playwright Fixtures**
   - `mount` - mounts React components
   - `page` - provides access to Playwright's page object
   - `expectScreenshot` - performs visual regression testing
   - Always use `async/await` for Playwright operations

9. **Waiting for Elements**

   Use Playwright's built-in waiting mechanisms:

   ```tsx
   // Wait for element to appear
   await page.getByText('Hello').waitFor();

   // Wait for element to be visible
   await page.locator('.element').waitFor({state: 'visible'});

   // Wait for timeout (use sparingly)
   await page.waitForTimeout(500);
   ```

10. **Test Tags**

    Use test tags for filtering:

    ```tsx
    test.describe('ComponentName', {tag: '@ComponentName'}, () => {
      // Tests
    });
    ```

### Test Organization Example

Based on a component with multiple stories:

**helpersPlaywright.tsx**:

```tsx
import {composeStories} from '@storybook/react';

import * as DefaultSubmitButtonStories from '../__stories__/SubmitButton.stories';

export const SubmitButtonStories = composeStories(DefaultSubmitButtonStories);
```

**SubmitButton.visual.spec.tsx**:

```tsx
import React from 'react';

import {test} from '~playwright/core';

import {SubmitButtonStories} from './helpersPlaywright';

test.describe('SubmitButton', {tag: '@SubmitButton'}, () => {
  // Visual regression tests for each story
  test('should render enabled state', async ({mount, expectScreenshot}) => {
    await mount(<SubmitButtonStories.Enabled />);

    await expectScreenshot();
  });

  test('should render disabled state', async ({mount, expectScreenshot}) => {
    await mount(<SubmitButtonStories.Disabled />);

    await expectScreenshot();
  });

  test('should render loading state', async ({mount, expectScreenshot}) => {
    await mount(<SubmitButtonStories.Loading />);

    await expectScreenshot();
  });

  test('should render cancelable state', async ({mount, expectScreenshot}) => {
    await mount(<SubmitButtonStories.Cancelable />);

    await expectScreenshot();
  });

  test('should render all sizes', async ({mount, expectScreenshot}) => {
    await mount(<SubmitButtonStories.Size />);

    await expectScreenshot();
  });

  // Interaction test
  test('should handle button click', async ({mount, page}) => {
    let clicked = false;

    await mount(
      <SubmitButtonStories.Enabled
        onClick={() => {
          clicked = true;
        }}
      />,
    );

    const button = page.getByRole('button');
    await button.click();

    // Additional assertions if needed
    await page.waitForTimeout(100);
  });

  // Test disabled state prevents clicks
  test('should not respond to clicks when disabled', async ({mount, page}) => {
    await mount(<SubmitButtonStories.Disabled />);

    const button = page.getByRole('button');
    expect(await button.isDisabled()).toBeTruthy();
  });
});
```

---

## README Documentation

Every component must have a comprehensive README.md file documenting its purpose, usage, and API.

**All documentation text MUST be written in English.**

### README Structure

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

### README Sections Breakdown

#### 1. **Component Title and Description**

- Use H1 (`#`) for the component name
- Provide a concise one-line description
- Description should explain WHAT the component is and its PRIMARY purpose

**Example**:

```markdown
# SubmitButton

A submit button component with state management through props and send/cancel icon switching.
```

#### 2. **Features Section**

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

#### 3. **Usage Section**

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

#### 4. **Props Section**

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

#### 5. **Additional Content Sections** (as needed)

##### States Section (for stateful components)

```markdown
## States

The component supports the following states:

- **enabled**: Description of enabled state
- **disabled**: Description of disabled state
- **loading**: Description of loading state
```

##### Variants Section (for components with variants)

```markdown
## Variants

### Size Variants

- **s**: Small size (24px height)
- **m**: Medium size (32px height) - default
- **l**: Large size (40px height)
```

##### Keyboard Support Section

```markdown
## Keyboard Support

- `Enter` - Submit the form
- `Shift+Enter` - Create new line
- `Escape` - Clear input
```

##### Accessibility Section

```markdown
## Accessibility

The component implements the following accessibility features:

- Uses semantic `<button>` element
- Includes appropriate ARIA labels
- Supports keyboard navigation
- Announces state changes to screen readers
```

#### 6. **Styling Section**

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

#### 7. **Implementation Details Section** (Optional)

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

### README Best Practices

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

### README Template Checklist

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

---

## Summary

This memory bank provides comprehensive guidelines for:

1. **Storybook Development**: Creating consistent, well-documented stories using standardized templates
2. **Testing Strategy**: Mapping tests directly to stories for consistency and coverage
3. **Documentation**: Writing clear, complete README files with proper structure and CSS variable documentation

**Key Principles**:

- **Consistency**: Follow templates and patterns across all components
- **Completeness**: Document all features, props, and styling options
- **English Only**: All documentation must be in English
- **Test-Story Alignment**: Tests should map directly to stories
- **User-Focused**: Write documentation for component consumers, not just developers

By following these guidelines, we ensure high-quality, maintainable, and well-documented components throughout the AIKit project.
