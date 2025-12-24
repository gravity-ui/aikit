import {memo} from 'react';

import transform from '@diplodoc/transform';
import '@diplodoc/transform/dist/js/yfm';
import {OptionsType} from '@diplodoc/transform/lib/typings';

export interface MarkdownBlockProps {
    block: string;
    transformOptions?: OptionsType;
    className?: string;
}

function areEqual(prevProps: MarkdownBlockProps, nextProps: MarkdownBlockProps): boolean {
    if (prevProps.block !== nextProps.block) {
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
}

export const MarkdownBlock = memo<MarkdownBlockProps>(({block, transformOptions, className}) => {
    let html = '';
    try {
        const result = transform(block, transformOptions);
        html = result.result.html;
    } catch {
        // eslint-disable-next-line no-console
        console.error('Error transforming block:', block);
        return '';
    }

    return <div className={className} dangerouslySetInnerHTML={{__html: html}} />;
}, areEqual);

MarkdownBlock.displayName = 'MarkdownBlock';
