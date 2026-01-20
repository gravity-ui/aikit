import {memo} from 'react';

import {OptionsType} from '@diplodoc/transform/lib/typings';

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

    return areOptionsEqual(prevProps.transformOptions, nextProps.transformOptions);
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
