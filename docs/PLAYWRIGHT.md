# Playwright Commands Quick Reference

## Test Execution

```bash
# Run all component tests
npm run test:ct

# Run with interactive UI mode
npm run test:ct:ui

# Update screenshot baselines (when visual changes are intentional)
npm run test:ct:update
```

## Viewing Reports

```bash
# Open last HTML report
npx playwright show-report
```

## Common Use Cases

### After making visual changes to a component

```bash
# 1. Review changes with UI mode
npm run test:ct:ui

# 2. If changes look correct, update baselines
npm run test:ct:update
```

### Debugging a failing test

```bash
# Run with UI mode to see what's happening
npm run test:ct:ui
```

## Test Structure

Tests are located in `src/Component/__tests__/Component.spec.tsx`
Baselines are stored in `__snapshots__/Component/__tests__/Component.spec.tsx-snapshots/`

## Configuration

- Config file: `playwright-ct.config.ts`
- Browser: Chromium (Desktop Chrome)
- Timeout: 10 seconds per test
- Retries: 2 (only in CI)
