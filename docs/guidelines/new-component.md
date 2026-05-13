# Adding a New Component

A checklist for everything that must be wired up when creating a new component inside `src/components/<level>/<Name>/`. Missing any of these makes the component invisible to consumers, breaks tree-shaking, or fails CI.

## 1. Component files

Standard layout under `src/components/<level>/<Name>/`:

```
<Name>/
├── <Name>.tsx               # Implementation
├── <Name>.scss              # Styles (if any)
├── types.ts                 # Component types (if separated)
├── index.ts                 # Re-exports public API
├── README.md                # See guidelines/readme.md
├── i18n/                    # Optional, see guidelines/i18n
├── __stories__/             # See guidelines/storybook.md
│   ├── Docs.mdx
│   └── <Name>.stories.tsx
└── __tests__/               # See guidelines/testing.md
    ├── <Name>.visual.spec.tsx
    └── helpersPlaywright.tsx
```

## 2. Level barrel — `src/components/<level>/index.ts`

Add `export * from './<Name>'` so the component is reachable from the main package entry.

```typescript
// src/components/atoms/index.ts
export * from './ActionButton';
export * from './Alert';
// …
export * from './<Name>'; // ← add here
```

Without this step, `import {<Name>} from '@gravity-ui/aikit'` returns `undefined`.

## 3. `package.json` subpath export

The block of per-component subpath exports in `package.json` is **auto-generated** from the on-disk tree. After step 1 (component directory exists on disk), run:

```bash
npm run generate:exports
```

This rewrites `package.json#exports`, adding `./<Name>` pointing at `./build/{esm,cjs}/components/<level>/<Name>/index.{d.ts,js}` for every component directory under `src/components/`. Non-component entries (`.`, `./types`, `./hooks`, `./utils/*`, `./adapters`, `./themes/*`, `./server/*`, …) are preserved.

A husky pre-commit hook runs `npm run generate:exports:check` and **fails the commit** if you forget to regenerate — see [scripts/generate-exports.js](../../scripts/generate-exports.js).

The resulting entry enables `import {<Name>} from '@gravity-ui/aikit/<Name>'` and is required for downstream bundlers to tree-shake the rest of the library.

## 4. Documentation surfaces

Three places list the public component catalog. Add the new component to all of them:

| File                        | What to add                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `docs/COMPONENTS.md`        | One row in the `## <Level>` table — name + one-line description                       |
| `llms.txt`                  | One bullet under `## Components — <Level>` with the GitHub README URL and description |
| `docs/PROJECT_STRUCTURE.md` | Mention in the directory listing under the appropriate level                          |

After editing docs, regenerate `llms-full.txt`:

```bash
npm run generate:llms
```

## 5. Regression check

The husky pre-commit hook runs this for you, but you can verify manually:

```bash
npm run generate:exports:check    # exit 1 if exports are out of sync
```

## Common Mistakes

- Forgetting `npm run generate:exports` — husky pre-commit will catch it; run the command and stage `package.json`
- Forgetting the level barrel (`src/components/<level>/index.ts`) — component is unreachable from `'@gravity-ui/aikit'` entirely; the export generator does NOT touch barrels
- Adding to `COMPONENTS.md` / `llms.txt` but skipping `npm run generate:llms` so `llms-full.txt` lags behind
