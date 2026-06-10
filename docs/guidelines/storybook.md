# Storybook Files Creation

All components should have Storybook stories for documentation and testing purposes. Stories are located in the `__stories__` directory within each component folder.

## Directory Structure

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

## 1. Docs.mdx Template

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

## 2. Stories File Template

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
