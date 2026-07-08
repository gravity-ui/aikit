import {memo, useMemo} from 'react';

import type {
    ExtendedPluginWithCollect,
    MarkdownIt,
    OptionsType,
} from '@diplodoc/transform/lib/typings';

import {useMarkdownTransform} from '../../../hooks/useMarkdownTransform';
import {useRemend} from '../../../hooks/useRemend';
import {block} from '../../../utils/cn';
import {areOptionsEqual} from '../../../utils/markdownUtils';

import './MarkdownRenderer.scss';

const b = block('markdown-renderer');

export interface MarkdownRendererProps {
    content: string;
    className?: string;
    qa?: string;
    transformOptions?: OptionsType;
    shouldParseIncompleteMarkdown?: boolean;
    openLinksInNewTab?: boolean;
}

const openLinksInNewTabPlugin: ExtendedPluginWithCollect = ((md: MarkdownIt) => {
    const rendererRules = md.renderer.rules;
    const defaultRender =
        rendererRules.link_open ||
        function (tokens, idx, options, _env, self) {
            return self.renderToken(tokens, idx, options);
        };

    rendererRules.link_open = function (tokens, idx, options, env, self) {
        const href = tokens[idx].attrGet('href');
        if (!href?.startsWith('#')) {
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
}: MarkdownRendererProps) {
    const closedContent = useRemend(content, shouldParseIncompleteMarkdown);
    const finalTransformOptions = useMemo<OptionsType | undefined>(() => {
        if (!openLinksInNewTab) {
            return transformOptions;
        }

        return {
            ...transformOptions,
            plugins: [...(transformOptions?.plugins ?? []), openLinksInNewTabPlugin],
        };
    }, [openLinksInNewTab, transformOptions]);
    const html = useMarkdownTransform(closedContent, finalTransformOptions);

    return (
        <div
            className={b(null, [className, 'yfm'])}
            data-qa={qa}
            dangerouslySetInnerHTML={{__html: html}}
        />
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

    return areOptionsEqual(prevProps.transformOptions, nextProps.transformOptions);
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
