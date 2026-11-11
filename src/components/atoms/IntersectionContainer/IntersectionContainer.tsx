import React from 'react';

import {useIntersection} from '@gravity-ui/uikit';

import {useChatViewActivity} from '../../../hooks/ChatViewActivity';
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
    const {active} = useChatViewActivity();
    const [ref, setRef] = React.useState<Element | null>(null);

    useIntersection({
        element: active ? ref : null,
        onIntersect: active ? onIntersect : undefined,
        options,
    });

    if (onIntersect) {
        return (
            <div className={b('container', className)} ref={setRef}>
                {children}
            </div>
        );
    }

    return children;
};
