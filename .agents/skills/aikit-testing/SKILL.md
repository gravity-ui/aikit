---
name: aikit-testing
description: AIKit Playwright Component Testing conventions — helpersPlaywright.tsx, *.visual.spec.tsx, Docker-required test execution, one test per story, screenshots for portal-mounted dialogs. Use when creating or editing files under a component's __tests__/ directory.
---

Read `docs/guidelines/testing.md` and follow it when creating or modifying Playwright tests for AIKit components.

Tests must be run via `npm run playwright:docker` (and `npm run playwright:docker:update` to refresh snapshots) — not local Playwright.
