import type {HTMLAttributes} from 'react';

import type {OptionsType} from '@diplodoc/transform/lib/typings';
import type {MDXComponents} from 'mdx/types';

import type {MermaidOptions} from '../utils/renderMermaid';

export type {MermaidOptions} from '../utils/renderMermaid';

/**
 * Options for rendering embedded MDX/JSX in the markdown content via
 * `@diplodoc/mdx-extension`. Passing `mdxOptions` enables MDX processing.
 */
export interface MarkdownRendererMdxOptions {
    /** Map of components rendered from embedded MDX/JSX in the markdown content. */
    components: MDXComponents;
    /** Optional list of tag names to limit which components are processed as MDX. */
    tagNames?: string[];
    /** CSP nonce applied to compiled MDX scripts. Defaults to a nonce found in the document. */
    nonce?: string;
}

export interface MarkdownRendererProps {
    content: string;
    className?: string;
    qa?: string;
    transformOptions?: OptionsType;
    shouldParseIncompleteMarkdown?: boolean;
    openLinksInNewTab?: boolean;
    /** Enables Mermaid diagrams using the supplied lazy loader. Disabled by default. */
    mermaidOptions?: MermaidOptions;
    mdxOptions?: MarkdownRendererMdxOptions;
    mdxContext?: Record<string, unknown>;
    /** Extra props forwarded to the root container `div` element. */
    extraProps?: HTMLAttributes<HTMLDivElement>;
}
