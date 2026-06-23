import {Flex, Spin, Text} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './Loader.scss';
const b = block('loader');

export type LoaderSize = 'xs' | 's' | 'm';

export interface LoaderProps {
    view?: 'streaming' | 'loading';
    size?: LoaderSize;
    message?: string;
    className?: string;
    qa?: string;
}

export function Loader({view = 'streaming', size = 's', message, className, qa}: LoaderProps) {
    if (view === 'streaming') {
        const dots = (
            <div className={b({size}, className)} data-qa={qa}>
                <div className={b('left')} />
                <div className={b('center')} />
                <div className={b('right')} />
            </div>
        );

        if (!message) {
            return dots;
        }

        return (
            <Flex gap={2}>
                {dots}
                <Text variant="body-1" color="secondary">
                    {message}
                </Text>
            </Flex>
        );
    }

    return <Spin size={size} data-qa={qa} className={b({view}, className)} />;
}
