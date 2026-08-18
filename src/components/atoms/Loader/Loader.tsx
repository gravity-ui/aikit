import {Flex, Spin, Text, useMobile} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {Shimmer} from '../Shimmer';

import './Loader.scss';

const b = block('loader');

export type LoaderSize = 'xs' | 's' | 'm';

export interface LoaderProps {
    view?: 'streaming' | 'loading';
    size?: LoaderSize;
    message?: string;
    className?: string;
    qa?: string;
    withMessageShimmer?: boolean;
}

export function Loader({
    view = 'streaming',
    size = 's',
    message,
    className,
    withMessageShimmer,
    qa,
}: LoaderProps) {
    const isMobile = useMobile();
    const loader =
        view === 'streaming' ? (
            <div className={b({size}, message ? '' : className)} data-qa={qa}>
                <div className={b('left')} />
                <div className={b('center')} />
                <div className={b('right')} />
            </div>
        ) : (
            <Spin size={size} data-qa={qa} className={b({view}, message ? '' : className)} />
        );

    if (!message) {
        return loader;
    }

    const messageContent = (
        <Text variant={isMobile ? 'body-2' : 'body-1'} color="secondary">
            {message}
        </Text>
    );

    return (
        <Flex gap={2} className={b(null, className)}>
            {loader}
            {withMessageShimmer ? <Shimmer>{messageContent}</Shimmer> : messageContent}
        </Flex>
    );
}
