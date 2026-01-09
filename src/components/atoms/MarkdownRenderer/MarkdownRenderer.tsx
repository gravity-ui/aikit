import {memo} from 'react';

import {OptionsType} from '@diplodoc/transform/lib/typings';

import {useMarkdownTransform} from '../../../hooks/useMarkdownTransform';
import {useRemend} from '../../../hooks/useRemend';
import {block} from '../../../utils/cn';

import './MarkdownRenderer.scss';

const b = block('markdown-renderer');

export interface MarkdownRendererProps {
    content: string;
    className?: string;
    qa?: string;
    transformOptions?: OptionsType;
    shouldParseIncompleteMarkdown?: boolean;
}

function MarkdownRendererComponent({
    content,
    className,
    qa,
    transformOptions,
    shouldParseIncompleteMarkdown = false,
}: MarkdownRendererProps) {
    const closedContent = useRemend(content, shouldParseIncompleteMarkdown);
    const html = useMarkdownTransform(closedContent, transformOptions);

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

    if (prevProps.className !== nextProps.className) {
        return false;
    }

    if (prevProps.qa !== nextProps.qa) {
        return false;
    }

    const prevOptions = prevProps.transformOptions;
    const nextOptions = nextProps.transformOptions;

    if (prevOptions === nextOptions) {
        return true;
    }

    if (!prevOptions || !nextOptions) {
        return false;
    }

    const prevKeys = Object.keys(prevOptions);
    const nextKeys = Object.keys(nextOptions);

    if (prevKeys.length !== nextKeys.length) {
        return false;
    }

    for (const key of prevKeys) {
        if (prevOptions[key] !== nextOptions[key]) {
            return false;
        }
    }

    return true;
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
