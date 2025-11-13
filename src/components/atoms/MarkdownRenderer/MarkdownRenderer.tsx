import {useMemo} from 'react';

import transform from '@diplodoc/transform';
import '@diplodoc/transform/dist/js/yfm';

import {block} from '../../../utils/cn';

import './MarkdownRenderer.scss';

const b = block('markdown-renderer');

export interface MarkdownRendererProps {
    content: string;
    className?: string;
    qa?: string;
}

export function MarkdownRenderer({content, className, qa}: MarkdownRendererProps) {
    const html = useMemo(() => {
        if (typeof content !== 'string') {
            return '';
        }
        try {
            const result = transform(content);
            return result.result.html;
        } catch (error: unknown) {
            // eslint-disable-next-line no-console
            console.error('Error transforming markdown:', error);
            return '';
        }
    }, [content]);

    return (
        <div
            className={b(null, [className, 'yfm'])}
            data-qa={qa}
            dangerouslySetInnerHTML={{__html: html}}
        />
    );
}
