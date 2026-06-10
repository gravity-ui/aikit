# Code Style and Language Requirements

**CRITICAL: All code documentation, comments, and JSDoc must be written in English.**

This includes:

- **JSDoc comments**: All function, class, interface, and type documentation
- **Inline comments**: All explanatory comments within the code
- **TODO comments**: All task comments and notes
- **Git commit messages**: All commit descriptions and messages
- **Code review comments**: All discussions and feedback

## Examples

❌ **Incorrect** (Russian):

```tsx
/**
 * Хук для управления состоянием компонента
 * @param props - пропсы компонента
 * @returns объект с состоянием
 */
function useMyHook(props: Props) {
  // Обрабатываем клик
  const handleClick = () => {
    // Вызываем callback
    props.onClick();
  };

  return {handleClick};
}
```

✅ **Correct** (English):

```tsx
/**
 * Hook for managing component state
 * @param props - component props
 * @returns object with state
 */
function useMyHook(props: Props) {
  // Handle click event
  const handleClick = () => {
    // Call callback
    props.onClick();
  };

  return {handleClick};
}
```

## Why English?

- **International Collaboration**: Enables developers worldwide to contribute
- **Consistency**: Matches industry standards and open-source best practices
- **Maintainability**: Future developers will understand the codebase
- **Tooling**: Better IDE support and AI-assisted development
- **Documentation**: Aligns with all user-facing documentation

**Note**: UI text strings and user-facing messages should use i18n/localization and can be in multiple languages, but the code itself must use English.
