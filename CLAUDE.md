# AIKit Component Development Guidelines

**English-only**: all code comments, JSDoc, inline notes, TODO markers, and commit messages must be in English. UI strings (i18n) can be localized.

Detailed guidelines live in `docs/guidelines/`:

- [`docs/guidelines/code-style.md`](./docs/guidelines/code-style.md) — language requirements (examples, rationale)
- [`docs/guidelines/storybook.md`](./docs/guidelines/storybook.md) — `Docs.mdx` + `*.stories.tsx` templates
- [`docs/guidelines/testing.md`](./docs/guidelines/testing.md) — Playwright Component Testing (Docker)
- [`docs/guidelines/readme.md`](./docs/guidelines/readme.md) — component README structure

Read the relevant file before working on a component, its `__stories__/`, `__tests__/`, or `README.md`. Claude skills (`aikit-storybook`, `aikit-testing`, `aikit-readme`) and Cursor rules under `.cursor/rules/aikit-*` are thin pointers to the same files.

## Running Tests

```bash
# Run all tests in Docker
npm run playwright:docker

# Run specific component tests
npm run playwright:docker -- --grep "@ComponentName"

# Update visual snapshots
npm run playwright:docker:update
```

> **Important**: Always use Docker commands for Playwright tests — required for snapshot consistency with CI.
