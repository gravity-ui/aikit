# AskUserQuestion

A clarification card with answer options, question navigation, and a custom answer field.

## Features

- **Answer options**: Titles, descriptions, and recommendation badges.
- **Saved selection**: Controlled selection highlighting, separate from keyboard focus.
- **Optional progress**: Animated answer segments and a completion callback for safe dismissal.
- **Custom answers**: Submit text with Enter or the confirmation button.
- **Navigation**: Controlled question index and optional Skip button.
- **Keyboard support**: Number shortcuts and standard button navigation.
- **Theming**: Gravity UI tokens and English/Russian translations.

## Usage

```tsx
import {AskUserQuestion} from '@gravity-ui/aikit';

<AskUserQuestion
  question="Which setting should we use?"
  options={[{id: 'shared', title: 'Shared', recommended: true}]}
  onAnswer={(answer) => saveAnswer(answer)}
/>;
```

```tsx
<AskUserQuestion
  key={toolCallId}
  question={question.text}
  options={question.options}
  questionIndex={index}
  questionCount={questions.length}
  onQuestionChange={setIndex}
  selectedAnswer={answers[question.id]}
  answeredQuestionIndices={questions.flatMap((item, index) => (answers[item.id] ? [index] : []))}
  onAnswer={(answer) => saveAnswer(question.id, answer)}
  onProgressComplete={resumeWithSavedAnswers}
  onClose={closeQuestion}
  customAnswer={draft}
  onCustomAnswerChange={setDraft}
/>
```

The host owns navigation and answer persistence. `onAnswer` receives either
`{type: 'option', optionId}` or `{type: 'custom', value}`. Custom answers are trimmed.
Keep the same mounted card while navigating within one tool call so height and
progress transitions can finish. Use the tool-call ID as the React key to reset
local state between distinct tool calls. Use controlled answers and drafts to
preserve selection and text when navigating back. For one question, resume directly
in the host's `onAnswer`; `onProgressComplete` is only emitted for multi-question progress.

## Answers and conversation history

`AskUserQuestion` is a presentation component. It does not own the conversation,
append messages or activity steps, send tool results to a model, or resume an agent.
The calling application owns these operations.

`onAnswer` emits one of two values:

```ts
{type: 'option', optionId: 'shared'}
{type: 'custom', value: 'Use a separate palette for each workspace.'}
```

An option answer contains its stable ID, not its title or description. Custom text
is trimmed and empty submissions are ignored. The question ID is not part of the
callback payload: attach it in the handler that renders the current question.

For a multi-question tool call, the application should:

1. Keep question definitions, the active index, answers, and drafts keyed by stable
   question IDs. Keep the original option ID and custom text as structured data.
2. Save each answer and create or update its own activity step. Show the question
   and the corresponding answer; three answered questions produce three entries.
   Replace the entry when an answer changes instead of appending a duplicate.
3. Navigate to an unanswered question. `onQuestionChange` changes only the index;
   it does not submit an answer. Use controlled `customAnswer` drafts to preserve
   text across navigation and placement changes.
4. Keep the run in `needs-input` until all required questions have answers.
   Then submit the collected answers through the application's model/tool adapter
   and continue the same run. Rendering a history entry alone does not send an
   answer to the model.

For example, the host can rebuild answer steps from its structured state:

```tsx
import type {AskUserQuestionAnswer} from '@gravity-ui/aikit';
import type {RunActivityStep} from '@gravity-ui/aikit/experimental';

type QuestionDefinition = {
  id: string;
  text: string;
  options: Array<{id: string; label: string}>;
};

function buildAnswerSteps(
  questions: QuestionDefinition[],
  answers: Record<string, AskUserQuestionAnswer>,
): RunActivityStep[] {
  return questions.flatMap((question) => {
    const answer = answers[question.id];
    if (!answer) return [];
    const label =
      answer.type === 'custom'
        ? answer.value
        : (question.options.find((option) => option.id === answer.optionId)?.label ??
          answer.optionId);
    return [
      {
        id: `answer-${question.id}`,
        kind: 'commentary',
        content: (
          <>
            <strong>{question.text}</strong>
            <div>{label}</div>
          </>
        ),
      },
    ];
  });
}
```

Combine these entries with the run's other steps. Keep model/tool payloads separate
from the human-readable labels in `content`. The exact payload schema depends on
that adapter and is not defined by AIKit.

`onClose` is only a close/skip notification. It does not emit `onAnswer`, choose a
recommended option, or mark unanswered questions as answered. The application
must record a skip separately from a user-selected answer. The Storybook demo
preserves saved answers and records unanswered questions as skipped; it never
substitutes recommended options.

See [AgentChat integration](../../pages/AgentChat/README.md#clarification-questions)
and the **Clarification Question** Storybook scenario for the complete local flow.

The host saves each `onAnswer` result and resumes the model automatically once
all required answers are collected. Users can revisit saved answers while other
questions remain unanswered. Skips must be recorded explicitly without substituting
recommended answers.

Pass the saved `selectedAnswer` for the current question when navigating back.
Selected predefined and custom responses use `--g-color-base-selection` independently
of keyboard focus. Predefined answer buttons expose their selection with `aria-pressed`.

Pass `answeredQuestionIndices` to enable optional segmented progress for multiple
questions. Each answered question fills its own segment over 220 ms, so answering
out of order remains accurate. Skipped questions are excluded. Omit the prop to
hide progress; single questions never show it. Reduced motion disables the animation.
Use `onProgressComplete` to dismiss the card and resume the model after the final
segment finishes filling. It waits for actual progress animations, with no fixed
delay, and runs immediately when reduced motion disables them. Completion is
cancelled if progress becomes incomplete or the card unmounts.

## Props

| Prop                      | Type                                      | Required | Default   | Description                                                       |
| ------------------------- | ----------------------------------------- | -------- | --------- | ----------------------------------------------------------------- |
| `question`                | `string`                                  | ✓        | -         | Question text                                                     |
| `options`                 | `AskUserQuestionOption[]`                 | ✓        | -         | Unique IDs, titles, optional descriptions, recommendation flags   |
| `selectedAnswer`          | `AskUserQuestionAnswer`                   | -        | -         | Saved answer for the current question                             |
| `onAnswer`                | `(answer: AskUserQuestionAnswer) => void` | ✓        | -         | Answer callback                                                   |
| `questionIndex`           | `number`                                  | -        | `0`       | Zero-based current index                                          |
| `onProgressComplete`      | `() => void`                              | -        | -         | All progress segments finished animating; use to dismiss the card |
| `answeredQuestionIndices` | `readonly number[]`                       | -        | -         | Enable segmented progress with zero-based answered indices        |
| `questionCount`           | `number`                                  | -        | `1`       | Total questions; navigation is shown when greater than one        |
| `onQuestionChange`        | `(index: number) => void`                 | -        | -         | Navigation callback; absent callback disables navigation          |
| `onClose`                 | `() => void`                              | -        | -         | Displays the Skip button and enables Escape                       |
| `allowCustomAnswer`       | `boolean`                                 | -        | `true`    | Displays custom answer field                                      |
| `customAnswer`            | `string`                                  | -        | -         | Controlled custom answer                                          |
| `onCustomAnswerChange`    | `(value: string) => void`                 | -        | -         | Draft change callback                                             |
| `customAnswerPlaceholder` | `string`                                  | -        | Localized | Input placeholder and accessible label                            |
| `showShortcuts`           | `boolean`                                 | -        | `true`    | Displays and enables number shortcuts                             |
| `footer`                  | `ReactNode`                               | -        | -         | Host-provided footer, Additional host-provided content            |
| `className`               | `string`                                  | -        | -         | Additional CSS class                                              |
| `qa`                      | `string`                                  | -        | -         | Test identifier                                                   |

## Keyboard Support

- Up / Down moves focus between answers, including the custom response row, and wraps at the ends.
- Enter on the custom response row focuses its input. Arrow keys inside the input retain normal text editing.
- On appearance and question changes, focus moves to the previously selected answer or the first answer,
  for both single and multiple questions. Focus is not taken from a non-empty text editor,
  other editable control, or another question card. An empty composer textarea can yield focus.
- Automatic focus has an explicit visible outline in both inline and composer placements, even after a mouse-triggered start.
  Pointer interaction clears this treatment; keyboard interaction restores it alongside `:focus-visible`.
- Tab / Shift+Tab moves through controls; Enter / Space activates buttons.
- Keys 1–9 select options without first focusing the card, except while editing text.
- The next number focuses the custom answer when fewer than nine options exist.
- Enter confirms a non-empty custom answer; Escape invokes `onClose`.

## Accessibility

The card is a group labelled by the question. Options are native buttons; the custom
field has an accessible label. Navigation controls and the Skip button have localized labels.
Progress updates are announced politely. If multiple cards are visible, shortcuts target the focused card or the first enabled card.

## Motion

Question content updates without fading. The card measures its natural
content height and interpolates height changes over 220 ms, including transitions
to questions without custom input. Navigation and answer state remain controlled
by the host. `prefers-reduced-motion` disables the height animation.

## Styling

Progress sits below the answers and optional footer. It uses `--g-color-base-info-heavy` for filled segments and `--g-color-line-generic` for empty segments.

`--g-color-base-selection` supplies the persistent background for a saved answer.

| Variable                                                                                | Description                                           |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `--g-aikit-ask-user-question-width`                                                     | Card width, default `480px`, limited by its container |
| `--g-color-base-background`                                                             | Card background                                       |
| `--g-color-base-selection`                                                              | Saved answer background                               |
| `--g-color-base-info-heavy`                                                             | Filled progress segments                              |
| `--g-color-line-generic`                                                                | Empty progress segments and shortcut border           |
| `--g-border-radius-xs`                                                                  | Progress segment radius                               |
| `--g-text-subheader-2-font-size`, `--g-text-subheader-2-line-height`                    | Question typography                                   |
| `--g-color-base-simple-hover`                                                           | Hovered option background                             |
| `--g-color-text-primary`                                                                | Question and option text                              |
| `--g-color-text-secondary`                                                              | Descriptions, progress and arrows                     |
| `--g-color-text-utility`                                                                | Card border                                           |
| `--g-color-line-focus`                                                                  | Keyboard focus outline                                |
| `--g-color-line-generic-hover`                                                          | Custom field hover border                             |
| `--g-color-line-generic-active`                                                         | Active or filled custom field border                  |
| `--g-border-radius-xl`                                                                  | Card radius                                           |
| `--g-border-radius-m`                                                                   | Answer radius                                         |
| `--g-spacing-1`, `--g-spacing-2`, `--g-spacing-3`                                       | Layout spacing                                        |
| `--g-text-body-font-family`, `--g-text-body-1-font-size`, `--g-text-body-1-line-height` | Body typography                                       |
| `--g-text-subheader-font-family`, `--g-text-subheader-font-weight`                      | Question and title typography                         |
| `--g-text-input-text-indent`                                                            | Input text inset, set to zero inside the card         |

```css
.wide-question {
  --g-aikit-ask-user-question-width: 640px;
}
```
