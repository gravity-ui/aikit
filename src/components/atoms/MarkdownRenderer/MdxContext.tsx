import {createContext, useContext} from 'react';

/**
 * Per-render React context for MDX components rendered by {@link MarkdownRenderer}.
 *
 * The value is whatever the consumer passes via the `mdxContext` prop of
 * `MarkdownRenderer`. Because each message renders its own `MarkdownRenderer`
 * instance, the context value is scoped to a single message, so embedded MDX
 * components can read data that is unique to the message they belong to
 * (for example the message id, metadata, or per-message callbacks).
 *
 * The value type is intentionally `unknown` so the library stays agnostic of
 * the consumer's shape; use {@link useMdxContext} with an explicit type
 * parameter to read it in a typed way.
 */
export const MdxDataContext = createContext<unknown>(undefined);

MdxDataContext.displayName = 'MdxDataContext';

/**
 * Read the per-message MDX context value provided through the `mdxContext` prop
 * of `MarkdownRenderer`. Intended to be called from inside components supplied
 * via `mdxOptions.components`.
 *
 * @typeParam T - The expected shape of the context value.
 * @returns The context value cast to `T`, or `undefined` when no `mdxContext`
 * was provided by the surrounding `MarkdownRenderer`.
 *
 * @example
 * ```tsx
 * interface MessageMdxContext {
 *     messageId: string;
 *     onPin: () => void;
 * }
 *
 * const PinButton = () => {
 *     const ctx = useMdxContext<MessageMdxContext>();
 *     return <button onClick={ctx?.onPin}>Pin {ctx?.messageId}</button>;
 * };
 * ```
 */
export function useMdxContext<T = unknown>(): T | undefined {
    return useContext(MdxDataContext) as T | undefined;
}
