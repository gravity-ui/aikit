# AIKit Component Development Guidelines

**English-only**: all code comments, JSDoc, inline notes, TODO markers, and commit messages must be in English. UI strings (i18n) can be localized.

Detailed guidelines live in `docs/guidelines/`:

- [`docs/guidelines/code-style.md`](./docs/guidelines/code-style.md) — language requirements (examples, rationale)
- [`docs/guidelines/storybook.md`](./docs/guidelines/storybook.md) — `Docs.mdx` + `*.stories.tsx` templates
- [`docs/guidelines/testing.md`](./docs/guidelines/testing.md) — Playwright Component Testing (Docker)
- [`docs/guidelines/readme.md`](./docs/guidelines/readme.md) — component README structure
- [`docs/guidelines/new-component.md`](./docs/guidelines/new-component.md) — checklist when adding a new component (level barrel + `package.json#exports` + docs catalog)

Read the relevant file before working on a component, its `__stories__/`, `__tests__/`, or `README.md`. Codex skills (`aikit-storybook`, `aikit-testing`, `aikit-readme`, `aikit-new-component`) and Cursor rules under `.cursor/rules/aikit-*` are thin pointers to the same files.

## Storybook example controls

When creating a story or editing an existing one that has controls for simulated application state, use the shared internal `StoryPlayground` wrapper from `src/demo/StoryPlayground/StoryPlayground.tsx`. Move scenario buttons, switches, and inputs into its `controls` slot and keep the demonstrated component in `children`. Do not place these controls inside the product preview or create a separate controls layout per story.

The wrapper places controls in a desktop sidebar and a mobile sheet. Keep scenario state in the story and use `previewStyle` for preview dimensions; do not nest a `ContentWrapper` decorator around it. Stories without scenario controls can keep their existing decorators. Apply this convention to the stories being changed; unrelated stories do not need to be migrated as part of another task. See [the Storybook guidelines](./docs/guidelines/storybook.md#example-state-controls) for the API and example.

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
