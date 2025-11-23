import React from 'react';

import {useIntersection} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './IntersectionContainer.scss';

const b = block('intersection-container');

interface IIntersectionContainerProps {
    children?: React.ReactNode;
    onIntersect?: () => void;
    options?: IntersectionObserverInit;
    className?: string;
}

export const IntersectionContainer = ({
    children,
    onIntersect,
    options,
    className,
}: IIntersectionContainerProps) => {
    const [ref, setRef] = React.useState<Element | null>(null);

    useIntersection({element: ref, onIntersect, options});

    if (onIntersect) {
        return (
            <div className={b('container', className)} ref={setRef}>
                {children}
            </div>
        );
    }

    return children;
};
