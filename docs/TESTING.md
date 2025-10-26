# Testing Guide

This project uses Playwright Component Testing for visual regression testing and component validation.

## Running Tests

### Run all component tests

```bash
npm run test:ct
```

### Run tests with UI mode (interactive)

```bash
npm run test:ct:ui
```

### Update screenshot baselines

```bash
npm run test:ct:update
```

## Writing Tests

Component tests are located alongside components in `__tests__` directories with `.spec.tsx` extension.

### Example Test

```typescript
import {test, expect} from '@playwright/experimental-ct-react';
import {MyComponent} from '../MyComponent';

test.describe('MyComponent', () => {
    test('should render correctly', async ({mount}) => {
        const component = await mount(<MyComponent />);
        await expect(component).toBeVisible();
    });

    test('should match screenshot', async ({mount}) => {
        const component = await mount(<MyComponent />);
        await expect(component).toHaveScreenshot('my-component.png');
    });
});
```

## Screenshot Testing

Screenshot tests create visual baselines that are compared on subsequent runs:

1. **First run** - Creates baseline screenshots in `__snapshots__` directories
2. **Subsequent runs** - Compares against baselines and fails if differences detected
3. **Update baselines** - Run `npm run test:ct:update` when visual changes are intentional

### Best Practices

- Keep screenshots focused on single components
- Test different states (default, hover, disabled, etc.)
- Test responsive behavior with different viewport sizes
- Name screenshots descriptively

## Test Organization

```
src/
├── Component/
│   ├── Component.tsx
│   └── __tests__/
│       ├── Component.test.ts          # Unit tests (Jest)
│       ├── Component.spec.tsx         # Component tests (Playwright)
│       └── __snapshots__/
│           └── Component.spec.tsx-snapshots/
│               └── component-default-chromium.png
```

## Debugging Failed Tests

When a test fails due to screenshot mismatch:

1. Check the test report: `playwright-report/index.html`
2. Review the diff images showing:
   - Expected (baseline)
   - Actual (current)
   - Diff (highlighted differences)
3. If changes are intentional, update baselines with `npm run test:ct:update`

## Configuration

Playwright configuration is in `playwright-ct.config.ts`:

- Test directory: `./src`
- Test pattern: `**/*.spec.tsx`
- Snapshot directory: `./__snapshots__`
- Timeout: 10 seconds per test
- Browser: Chromium (Desktop Chrome)

## Quick Command Reference

For a quick reference of Playwright commands, see [PLAYWRIGHT.md](./PLAYWRIGHT.md).
