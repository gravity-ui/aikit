import {Fragment, memo, useMemo, useRef} from 'react';

import {mdxPlugin} from '@diplodoc/mdx-extension';
import type {
    ExtendedPluginWithCollect,
    MarkdownIt,
    OptionsType,
} from '@diplodoc/transform/lib/typings';

import {useMarkdownTransform} from '../../../hooks/useMarkdownTransform';
import {useMermaid} from '../../../hooks/useMermaid';
import {useRemend} from '../../../hooks/useRemend';
import type {MarkdownRendererProps} from '../../../markdown/types';
import {block} from '../../../utils/cn';
import {getNewTabLinkAttributes} from '../../../utils/markdownLinks';
import {areOptionsEqual} from '../../../utils/markdownUtils';

export type {
    MarkdownRendererProps,
    MarkdownRendererMdxOptions,
    MermaidOptions,
} from '../../../markdown/types';

import {MdxPortals} from './MdxPortals';

import './MarkdownRenderer.scss';

const b = block('markdown-renderer');

const openLinksInNewTabPlugin: ExtendedPluginWithCollect = ((md: MarkdownIt) => {
    const rendererRules = md.renderer.rules;
    const defaultRender =
        rendererRules.link_open ||
        function (tokens, idx, options, _env, self) {
            return self.renderToken(tokens, idx, options);
        };

    rendererRules.link_open = function (tokens, idx, options, env, self) {
        const href = tokens[idx].attrGet('href');
        const attributes = getNewTabLinkAttributes(href);
        if (attributes) {
            for (const [name, value] of Object.entries(attributes)) {
                tokens[idx].attrSet(name, value);
            }
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
    mermaidOptions,
    mdxOptions,
    mdxContext,
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

        if (plugins.length === 0) {
            return transformOptions;
        }

        return {
            ...transformOptions,
            plugins,
        };
    }, [openLinksInNewTab, transformOptions, enableMdx, mdxTagNames]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const {html, mdxArtifacts} = useMarkdownTransform(
        closedContent,
        finalTransformOptions,
        enableMdx,
        Boolean(mermaidOptions),
    );

    useMermaid(containerRef, html, openLinksInNewTab, mermaidOptions);

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

    if (prevProps.mermaidOptions?.load !== nextProps.mermaidOptions?.load) {
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

    return areOptionsEqual(prevProps.transformOptions, nextProps.transformOptions);
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
