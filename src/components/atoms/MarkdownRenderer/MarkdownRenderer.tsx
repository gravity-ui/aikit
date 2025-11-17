import {useMemo} from 'react';

import transform from '@diplodoc/transform';
import '@diplodoc/transform/dist/js/yfm';
import {OptionsType} from '@diplodoc/transform/lib/typings';

import {block} from '../../../utils/cn';

import './MarkdownRenderer.scss';

const b = block('markdown-renderer');

export interface MarkdownRendererProps {
    content: string;
    className?: string;
    qa?: string;
    transformOptions?: OptionsType;
}

export function MarkdownRenderer({
    content,
    className,
    qa,
    transformOptions,
}: MarkdownRendererProps) {
    const html = useMemo(() => {
        if (typeof content !== 'string') {
            return '';
        }
        try {
            const result = transform(content, transformOptions);
            return result.result.html;
        } catch (error: unknown) {
            // eslint-disable-next-line no-console
            console.error('Error transforming markdown:', error);
            return '';
        }
    }, [content, transformOptions]);

    return (
        <div
            className={b(null, [className, 'yfm'])}
            data-qa={qa}
            dangerouslySetInnerHTML={{__html: html}}
        />
    );
}
