# AIKit 3.0.0 release notes

These notes describe the changes from **2.28.0 to 3.0.0**. For earlier releases, see the generated [CHANGELOG.md](../CHANGELOG.md). The [migration guide](migration-to-v3.md) ([Русский](migration-to-v3-ru.md)) provides the upgrade steps and before/after examples.

## Breaking changes

| Area                                | AIKit 2.28.0                           | AIKit 3.0.0                                     | Consumer action                                                                            |
| ----------------------------------- | -------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Node.js runtime                     | `>=20`                                 | Node 20.19+ within v20 or 22.12+                | Upgrade development, CI, and SSR runtimes for native CommonJS loading of ESM dependencies. |
| UIKit peer                          | `^7.25.0`                              | `^8.0.0`                                        | Upgrade UIKit and other packages that depend on it together.                               |
| Smallest context label/control size | `xxs`                                  | `2xs`                                           | Update explicit `ContextItem.size` and control-size helper arguments.                      |
| Custom history filters              | UIKit `ListItemData<ListItemChatData>` | AIKit `ListItemChatData`                        | Remove explicit legacy UIKit type wrappers; ordinary filter callbacks keep working.        |
| History markup                      | Legacy list with built-in search       | Stable List, separate combobox, grid rows/cells | Review custom row CSS, accessibility assertions, and selectors.                            |
| Header/attachment menus             | Legacy Menu/DropdownMenu               | Stable Menu/MenuItem                            | Review selectors and menu appearance; AIKit's menu configuration API stays the same.       |
| Inherited UIKit behavior            | UIKit 7 providers, colors, dialogs     | UIKit 8 providers, colors, dialogs              | Migrate the application root to Provider, regenerate custom themes, review mobile dialogs. |

## Components and behavior

- **Localization:** use provider-aware translation hooks throughout AIKit, including memoized labels, so dynamic and independently scoped languages work without changing global configuration.
- **History / HistoryList:** migrate to the stable UIKit List with stable row identifiers and a named grid for interactive rows. Preserve date grouping, controlled selection, pinned chat ordering, pin/delete actions, search/custom filtering, full/lazy loading, and empty/loading states. Connect the search input to list keyboard navigation through `useListFocusOwner`, with grid popup and list autocomplete semantics. Memoize filtering across active-row changes and reuse the result to activate the first match after a query change.
- **Header:** migrate desktop dropdowns and the inline mobile menu to Menu/MenuItem. Preserve labels, icons, disabled items, callbacks, QA identifiers, placement of action groups, and the mobile sheet title option. Use controlled `Sheet.open`/`onOpenChange`.
- **AttachmentPicker:** migrate the upload/storage dropdown to Menu/MenuItem with an accessible trigger. Preserve direct upload mode and the existing upload/storage callbacks.
- **FileUploadDialog:** handle dismissal through UIKit's `onOpenChange` while retaining AIKit's `onClose` API. Apply/Cancel callbacks and upload-state checks remain in place.
- **PromptInput:** migrate command popup anchoring and dismissal to `anchorElement`/`onOpenChange`; command configuration remains compatible.
- **ContextItem:** support UIKit 8's `2xs` label size through the shared mobile control-size helpers.
- **Loader:** migrate Flex spacing to a spacing token, preserving the existing gap.
- **MarkdownRenderer / Mermaid:** replace the temporary SSR hook adapter with UIKit's `useLayoutEffect`; keep lazy loading, server safety, cached SVG restoration before paint, theme handling, and streaming cleanup.
- **MessageList:** preserve react-window v2 virtualization through a dependency alias compatible with UIKit 8's optional react-window v1 peer.

## Development and documentation

- Align the UIKit development and peer requirements at `^8.0.0`; regenerate the lockfile with normal npm peer validation.
- Leave the package.json and lockfile version bump to the automatically generated 3.0.0 release PR.
- Use Provider in Storybook and the Playwright application root; keep nested ThemeProvider scopes for theme-only previews. Pass language through Provider in Storybook.
- Update affected stories to the UIKit 8 dialog and layout APIs.
- Teach Jest to transform the ESM-only `colors-named` and `colors-named-hex` dependencies loaded by UIKit's stable ColorPicker, without replacing UIKit with a mock.
- Add integration coverage for keyboard search/selection, pin/delete actions, and desktop/mobile header menus; run CI against both the lockfile and minimum UIKit 8.0.0.
- Update setup/theming documentation and include the v3 guide in the LLM documentation bundle.

## Requirements that stay the same

React and React DOM 18/19, all other peer ranges, the optional Mermaid loader contract, AIKit entry points, and AIKit CSS-variable names retain their existing contracts. The release does not require the UIKit `/legacy` entry point or its optional peers.

## Automatic release and changelog

`CHANGELOG.md` is owned by `gravity-ui/release-action` and release-please. These detailed notes are maintained separately so a generated release entry does not duplicate a manually written 3.0.0 heading.

Use this Conventional Commit title for the squash merge:

```text
feat!: migrate AIKit to UIKit 8
```

Include this footer in the resulting commit body (ensure the merge dialog retains it):

```text
BREAKING CHANGE: AIKit 3 requires @gravity-ui/uikit ^8.0.0 and Node.js ^20.19.0 || >=22.12.0. Replace the xxs context label/control size with 2xs and migrate custom history/menu selectors. See docs/migration-to-v3.md and docs/changelog-v3.md for complete upgrade instructions and release notes.

Release-As: 3.0.0
```

The breaking-change marker selects a major release, and `Release-As` explicitly selects 3.0.0. After that commit reaches main, the existing workflow prepares the release PR and generates its changelog from commits since the previous release tag. Review that PR for version **3.0.0** in both manifests, a single new changelog section, and the migration link. Merging the release PR is the existing publication step. This implementation keeps the last released version in package.json and the lockfile; the generated release PR updates both to 3.0.0 together with CHANGELOG.md.
