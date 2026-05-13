---
name: aikit-new-component
description: AIKit component-creation checklist. Use whenever creating a new component under `src/components/<level>/<Name>/`, editing a level barrel (`src/components/<level>/index.ts`), or modifying `package.json#exports`. Ensures the component is reachable from the main entry, has a dedicated subpath export, and is listed in `docs/COMPONENTS.md` and `llms.txt`.
---

Read `docs/guidelines/new-component.md` and follow the full checklist before considering a new component done.

Critical points the checklist enforces:

- Add `export * from './<Name>'` to `src/components/<level>/index.ts` (level barrel).
- Add a `./<Name>` subpath to `package.json#exports` pointing at `./build/{esm,cjs}/components/<level>/<Name>/index.{d.ts,js}`.
- Add a row to `docs/COMPONENTS.md` and a bullet to `llms.txt` (under the matching `## Components — <Level>` section).
- Run `npm run generate:llms` after touching `llms.txt` or any `docs/*.md` to refresh `llms-full.txt`.

After edits, the regression check from `docs/guidelines/new-component.md` (§5) must print nothing.
