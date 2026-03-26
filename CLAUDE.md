# AIKit Component Development Guidelines

For detailed guidelines on developing components in this project, refer to [MEMORYBANK.md](./MEMORYBANK.md).

## Quick Reference

- **Code language**: All comments, JSDoc, and documentation must be written in **English**
- **Storybook**: Every component needs `__stories__/Docs.mdx` and `__stories__/ComponentName.stories.tsx`
- **Tests**: Every component needs `__tests__/helpersPlaywright.tsx` and `__tests__/ComponentName.visual.spec.tsx`
- **README**: Every component needs a README with Features, Usage, Props, and Styling sections

## Running Tests

```bash
# Run all tests in Docker
npm run playwright:docker

# Run specific component tests
npm run playwright:docker -- --grep "@ComponentName"

# Update visual snapshots
npm run playwright:docker:update
```

> **Important**: Always use Docker commands for Playwright tests to ensure consistency with CI/CD.

See [MEMORYBANK.md](./MEMORYBANK.md) for full templates, examples, and best practices.
