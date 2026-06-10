# Testing Guidelines

Tests should be created based on Storybook stories to ensure consistency between documentation and functionality. We use **Playwright Component Testing** for visual regression testing and interaction testing.

## Test File Structure

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

import {expect, test} from '~playwright/core';

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

**Important**: Always import `expect` from `~playwright/core`, not as a fixture parameter.

## Running Tests

**All Playwright tests MUST be run using Docker commands** to ensure consistency across different environments and to match the CI/CD pipeline behavior.

**Available Commands**:

1. **Run all tests in Docker**:

   ```bash
   npm run playwright:docker
   ```

2. **Run specific tests by tag**:

   ```bash
   npm run playwright:docker -- --grep "@ComponentName"
   ```

3. **Update visual snapshots in Docker**:

   ```bash
   npm run playwright:docker:update
   ```

4. **Update snapshots for specific tests**:
   ```bash
   npm run playwright:docker:update -- --grep "@ComponentName"
   ```

**Why Docker?**

- Ensures pixel-perfect consistency in visual regression tests
- Matches the exact environment used in CI/CD
- Eliminates differences caused by fonts, rendering engines, and OS-specific behaviors
- Required for updating snapshots that will be committed to the repository

**Note**: Local Playwright commands (`npm run playwright`, `npm run playwright:update`) should NOT be used as they may produce different snapshots than CI/CD.

## Testing Rules Based on Stories

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

   **Capturing full-screen dialogs / overlays**

   When a story opens a dialog (or any element) that renders **on top of the whole viewport via a React portal** (e.g. `FileUploadDialog`, modal pickers, full-screen sheets), the default mount root does not contain the portal — `expectScreenshot()` without options will miss the overlay. In that case pass the full `page` as the component and enable `fullPage`:

   ```tsx
   test('should render dialog open state', async ({mount, page, expectScreenshot}) => {
     await mount(<ComponentNameStories.WithDialog />);

     const trigger = page.locator('[data-qa="open-trigger"]');
     await trigger.click();
     await expect(page.getByRole('dialog')).toBeVisible();

     // Required for portal-mounted dialogs that cover the entire viewport.
     await expectScreenshot({component: page, fullPage: true});
   });
   ```

   Use `{component: page, fullPage: true}` **only** when the meaningful UI is rendered outside the component's mount root (portal / fixed overlay covering the viewport). For inline components keep `expectScreenshot()` without arguments.

3. **Interaction Testing**

   Test user interactions like clicks, hovers, and input:

   ```tsx
   test('should handle button click', async ({mount, page}) => {
     await mount(<ComponentNameStories.WithButton />);

     const button = page.getByRole('button', {name: 'Click me'});
     await button.click();

     // Verify the result using explicit assertions
     await expect(page.getByText('Clicked!')).toBeVisible();
   });
   ```

4. **Hover States and Tooltips**

   ```tsx
   test('should show tooltip on hover', async ({mount, page, expectScreenshot}) => {
     await mount(<ComponentNameStories.WithTooltip />);

     const element = page.locator('.element');
     await element.hover();

     // Wait for tooltip to appear using explicit assertion
     await expect(page.getByText('Tooltip text')).toBeVisible();

     await expectScreenshot();
   });
   ```

5. **Async Behavior Testing**

   For components with async operations:

   ```tsx
   test('should handle async operation', async ({mount, page}) => {
     await mount(<ComponentNameStories.WithAsync />);

     await page.getByRole('button').click();

     // Wait for async operation to complete using explicit assertion
     await expect(page.getByText('Loaded!')).toBeVisible();
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

   Use Playwright's explicit assertions instead of `waitFor()`:

   ```tsx
   // Prefer explicit assertions over waitFor()
   await expect(page.getByText('Hello')).toBeVisible();

   // Check element visibility
   await expect(page.locator('.element')).toBeVisible();

   // Check element state
   await expect(page.getByRole('button')).toBeDisabled();
   await expect(page.getByRole('button')).toBeEnabled();

   // Check element count
   await expect(page.locator('.item')).toHaveCount(5);

   // Wait for timeout (use sparingly, only for animations or delays)
   await page.waitForTimeout(500);
   ```

   **Why prefer `expect` over `waitFor()`:**
   - More readable and explicit about what's being verified
   - Better integration with Playwright's reporting system
   - More informative error messages when assertions fail
   - Follows Playwright best practices
   - Playwright actions (click, fill, etc.) already auto-wait for elements

10. **Test Tags**

    Use test tags for filtering:

    ```tsx
    test.describe('ComponentName', {tag: '@ComponentName'}, () => {
      // Tests
    });
    ```

## Test Organization Example

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

import {expect, test} from '~playwright/core';

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
    await expect(button).toBeDisabled();
  });
});
```
