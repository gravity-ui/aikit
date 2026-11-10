# ChatContentV2

> **Experimental.** This API is outside AIKit's stable compatibility guarantees. It may change or be removed in minor releases without a major version bump. Patch releases preserve compatibility. Pin an exact package version and review the changelog before upgrading.

Transcript and overlay composer layout with scroll cooperation.

## Features

- **Host state**: No backend execution or fixture defaults.
- **Composition**: Replaceable content and controlled callbacks.
- **Compatibility**: Incremental adoption alongside existing chat components.

## Usage

```tsx
import {ChatContentV2} from '@gravity-ui/aikit/experimental';
```

## Props

| Prop               | Type             | Required | Default | Description                                  |
| ------------------ | ---------------- | -------- | ------- | -------------------------------------------- |
| children           | ReactNode        | —        | —       | Transcript content                           |
| header             | ReactNode        | —        | —       | Fixed header above scroll viewport           |
| composer           | ReactNode        | —        | —       | Bottom overlay, measured dynamically         |
| streaming          | boolean          | —        | false   | Activity dots in down button                 |
| waitingForApproval | boolean          | —        | false   | Show approval state in the scroll control    |
| historyKey         | string or number | —        | —       | Change together with prepended older history |
| className          | string           | —        | —       | Root class                                   |

```tsx
<ChatContentV2 header={<MyHeader />} composer={<MyComposer />} streaming={running}>
  <MessageList messages={messages} scrollMode="external" />
</ChatContentV2>
```

The reader follows new content only at the bottom. Scrolling up stops following; clicking the down button resumes. Compact base components and RunActivity cooperate through a layout context to preserve scroll position during disclosure. No selectors or synthetic scroll events are required. A custom disclosure can use `useChatLayoutChange` to apply the same policy. Change `historyKey` only when prepending older history, in the same render as the content update.

## Styling

Uses `--g-color-line-generic` for the header boundary and `--g-color-base-background` for fades and the composer surface. Supply a constrained parent height.
