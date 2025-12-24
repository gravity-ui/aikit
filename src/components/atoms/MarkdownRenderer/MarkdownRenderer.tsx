import {memo, useId, useMemo} from 'react';

import {OptionsType} from '@diplodoc/transform/lib/typings';
import remend from 'remend';

import {block} from '../../../utils/cn';
import {parseMarkdownIntoBlocks} from '../../../utils/parse-blocks';

import {MarkdownBlock} from './MarkdownBlock';

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
    const generatedId = useId();

    const processedContent = useMemo(() => {
        if (typeof content !== 'string' || content === '') {
            return '';
        }
        try {
            return shouldParseIncompleteMarkdown ? remend(content.trim()) : content;
        } catch {
            return '';
        }
    }, [content, shouldParseIncompleteMarkdown]);

    const blocks = useMemo(() => {
        if (!processedContent) {
            return [];
        }
        try {
            return parseMarkdownIntoBlocks(processedContent);
        } catch {
            return [];
        }
    }, [processedContent]);

    return (
        <div className={b(null, [className, 'yfm'])} data-qa={qa}>
            {blocks.map((blockContent, index) => (
                <MarkdownBlock
                    key={`${generatedId}-${index}`}
                    block={blockContent}
                    transformOptions={transformOptions}
                />
            ))}
        </div>
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
