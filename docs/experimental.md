# Experimental APIs

> **Experimental.** This API is outside AIKit's stable compatibility guarantees. It may change or be removed in minor releases without a major version bump. Patch releases preserve compatibility. Pin an exact package version and review the changelog before upgrading.

```tsx
import {
  AgentChat,
  AgentComposer,
  RunActivity,
  ChatContentV2,
  ChangedFilesSummary,
  ScrollToBottomButton,
} from '@gravity-ui/aikit/experimental';
import type {
  AgentComposerProps,
  AgentModelOption,
  AgentChatRun,
  RunActivityProps,
} from '@gravity-ui/aikit/experimental';
```

## Compatibility and releases

- The stable root and stable component subpaths retain their compatibility guarantees.
- Experimental components, associated types and hooks use the explicit `/experimental` entry. They are not re-exported from the stable root or ordinary component subpaths.
- Experimental APIs may change or be removed in a minor release without a deprecation period. Patch releases must preserve their API and behavior contracts.
- Document every incompatible experimental change and its migration in the release notes. Use a `feat(experimental):` commit for incompatible experimental changes so release automation increments the minor version. Do not use `!` or a `BREAKING CHANGE` footer solely for an experimental change; stable API breaks still require a major release.
- Pin an exact package version and review release notes before upgrading. A PR prerelease package is separate from a component's experimental status.
- Promotion to stable is explicit: review the API, provide the stable export and migration instructions, update all maturity markers together, and preserve the experimental entry for the remainder of that major where practical.

## Scope

All exports from `@gravity-ui/aikit/experimental` are experimental, including AgentComposer, AgentToolAttention, component props, model/file/run types, and useChatLayoutChange.

The optional compact presentation members of ThinkingMessage and ToolMessage are also experimental and marked in their types and READMEs. Their default presentation remains stable. Generic additive slots (`footerContent`, `renderAssistantFooter`), ToolFooter action sizing and MessageList external scrolling are stable capabilities.

## Adding an experiment

Register the component in `src/components/stability.json`, export it from `src/experimental/index.ts`, and omit it from the stable level barrel. Annotate its public declarations with `@experimental`, add the notice before README usage, place its stories in `experimental/`, and mark its catalog entries. Run `npm run generate:exports`, `npm run generate:llms`, and `npm run check:experimental`.

The stability registry is authoritative for export generation; editing package.json alone is insufficient. Shared internal renderers live under `src/components/internal` and are not public components.
