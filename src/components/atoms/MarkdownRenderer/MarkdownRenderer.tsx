import {Fragment, type HTMLAttributes, type ReactNode, memo, useMemo, useRef} from 'react';

import {mdxPlugin} from '@diplodoc/mdx-extension';
import type {
    ExtendedPluginWithCollect,
    MarkdownIt,
    OptionsType,
} from '@diplodoc/transform/lib/typings';
import type {MDXComponents} from 'mdx/types';

import {useMarkdownTransform} from '../../../hooks/useMarkdownTransform';
import {useRemend} from '../../../hooks/useRemend';
import {block} from '../../../utils/cn';
import {markdownCodeBlockPlugin} from '../../../utils/markdownCodeBlockPlugin';
import {areOptionsEqual} from '../../../utils/markdownUtils';

import {CodeBlockActionsPortals} from './CodeBlockActionsPortals';
import {MdxPortals} from './MdxPortals';

import './MarkdownRenderer.scss';

const b = block('markdown-renderer');

/**
 * Options for rendering embedded MDX/JSX in the markdown content via
 * `@diplodoc/mdx-extension`. Passing `mdxOptions` enables MDX processing.
 */
export interface MarkdownRendererMdxOptions {
    /** Map of components rendered from embedded MDX/JSX in the markdown content. */
    components: MDXComponents;
    /** Optional list of tag names to limit which components are processed as MDX. */
    tagNames?: string[];
    /** CSP nonce applied to scripts that execute compiled MDX artifacts. */
    nonce?: string;
}

export interface MarkdownCodeBlock {
    /** Fenced code content with one parser-added trailing line feed removed. */
    code: string;
    /** Lowercase language parsed from the first fence info token. */
    language?: string;
    /** Zero-based code block index within this MarkdownRenderer. */
    index: number;
}

export type MarkdownCodeBlockActionsVisibility = 'hover' | 'always';

export interface MarkdownCodeBlockActionsConfig {
    /** Renders actions for a fenced code block. Return null to omit actions for the block. */
    render: (block: MarkdownCodeBlock) => ReactNode;
    /** Controls the native code toolbar visibility for blocks with rendered actions. */
    visibility?: MarkdownCodeBlockActionsVisibility;
}

export interface MarkdownRendererProps {
    content: string;
    className?: string;
    qa?: string;
    transformOptions?: OptionsType;
    shouldParseIncompleteMarkdown?: boolean;
    openLinksInNewTab?: boolean;
    mdxOptions?: MarkdownRendererMdxOptions;
    mdxContext?: Record<string, unknown>;
    codeBlockActions?: MarkdownCodeBlockActionsConfig;
    /** Extra props forwarded to the root container `div` element. */
    extraProps?: HTMLAttributes<HTMLDivElement>;
}

const ABSOLUTE_HTTP_URL_RE = /^(https?:)?\/\//i;

const isSameDocumentAnchor = (href: string) => {
    if (href.startsWith('#')) {
        return true;
    }

    if (ABSOLUTE_HTTP_URL_RE.test(href) || typeof window === 'undefined') {
        return false;
    }

    try {
        const url = new URL(href, window.location.href);

        return (
            Boolean(url.hash) &&
            url.origin === window.location.origin &&
            url.pathname === window.location.pathname &&
            url.search === window.location.search
        );
    } catch {
        return false;
    }
};

const openLinksInNewTabPlugin: ExtendedPluginWithCollect = ((md: MarkdownIt) => {
    const rendererRules = md.renderer.rules;
    const defaultRender =
        rendererRules.link_open ||
        function (tokens, idx, options, _env, self) {
            return self.renderToken(tokens, idx, options);
        };

    rendererRules.link_open = function (tokens, idx, options, env, self) {
        const href = tokens[idx].attrGet('href');
        if (!href || !isSameDocumentAnchor(href)) {
            tokens[idx].attrSet('target', '_blank');
            tokens[idx].attrSet('rel', 'noopener noreferrer');
        }

        return defaultRender(tokens, idx, options, env, self);
    };
}) as ExtendedPluginWithCollect;

function MarkdownRendererComponent({
    content,
    className,
    qa,
    transformOptions,
    shouldParseIncompleteMarkdown = false,
    openLinksInNewTab = false,
    mdxOptions,
    mdxContext,
    codeBlockActions,
    extraProps,
}: MarkdownRendererProps) {
    const closedContent = useRemend(content, shouldParseIncompleteMarkdown);
    const enableMdx = Boolean(mdxOptions);
    const mdxComponents = mdxOptions?.components;
    const mdxTagNames = mdxOptions?.tagNames;
    const mdxNonce = mdxOptions?.nonce;
    const finalTransformOptions = useMemo<OptionsType | undefined>(() => {
        const plugins = [...(transformOptions?.plugins ?? [])];

        if (openLinksInNewTab) {
            plugins.push(openLinksInNewTabPlugin);
        }

        if (enableMdx) {
            plugins.push(
                mdxPlugin(
                    mdxTagNames ? {tagNames: mdxTagNames} : undefined,
                ) as unknown as ExtendedPluginWithCollect,
            );
        }

        if (codeBlockActions) {
            plugins.push(markdownCodeBlockPlugin);
        }

        if (plugins.length === 0) {
            return transformOptions;
        }

        return {
            ...transformOptions,
            plugins,
        };
    }, [openLinksInNewTab, transformOptions, enableMdx, mdxTagNames, Boolean(codeBlockActions)]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const {
        html,
        mdxArtifacts,
        codeBlocks = [],
    } = useMarkdownTransform(closedContent, finalTransformOptions, enableMdx);

    return (
        <Fragment>
            <div
                ref={containerRef}
                className={b(null, [className, 'yfm'])}
                data-qa={qa}
                dangerouslySetInnerHTML={{__html: html}}
                {...extraProps}
            />
            {enableMdx ? (
                <MdxPortals
                    refCtr={containerRef}
                    html={html}
                    components={mdxComponents}
                    mdxArtifacts={mdxArtifacts}
                    nonce={mdxNonce}
                    mdxContext={mdxContext}
                />
            ) : null}
            {codeBlockActions ? (
                <CodeBlockActionsPortals
                    refCtr={containerRef}
                    html={html}
                    codeBlocks={codeBlocks}
                    config={codeBlockActions}
                />
            ) : null}
        </Fragment>
    );
}

export const MarkdownRenderer = memo(MarkdownRendererComponent, (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) {
        return false;
    }

    if (prevProps.shouldParseIncompleteMarkdown !== nextProps.shouldParseIncompleteMarkdown) {
        return false;
    }

    if (prevProps.openLinksInNewTab !== nextProps.openLinksInNewTab) {
        return false;
    }

    if (prevProps.className !== nextProps.className) {
        return false;
    }

    if (prevProps.qa !== nextProps.qa) {
        return false;
    }

    if (prevProps.mdxOptions?.components !== nextProps.mdxOptions?.components) {
        return false;
    }

    if (prevProps.mdxOptions?.tagNames !== nextProps.mdxOptions?.tagNames) {
        return false;
    }

    if (prevProps.mdxOptions?.nonce !== nextProps.mdxOptions?.nonce) {
        return false;
    }

    if (prevProps.mdxContext !== nextProps.mdxContext) {
        return false;
    }

    if (prevProps.extraProps !== nextProps.extraProps) {
        return false;
    }

    if (prevProps.codeBlockActions?.render !== nextProps.codeBlockActions?.render) {
        return false;
    }

    if (prevProps.codeBlockActions?.visibility !== nextProps.codeBlockActions?.visibility) {
        return false;
    }

    return areOptionsEqual(prevProps.transformOptions, nextProps.transformOptions);
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
