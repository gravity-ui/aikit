import {Spin} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './Loader.scss';
const b = block('loader');

export type LoaderSize = 'xs' | 's' | 'm';

export interface LoaderProps {
    view?: 'streaming' | 'loading';
    size?: LoaderSize;
    className?: string;
    qa?: string;
}

export function Loader({view = 'streaming', size = 's', className, qa}: LoaderProps) {
    if (view === 'streaming') {
        return (
            <div className={b({size}, className)} data-qa={qa}>
                <div className={b('left')} />
                <div className={b('center')} />
                <div className={b('right')} />
            </div>
        );
    }

    return <Spin size={size} data-qa={qa} className={b({view}, className)} />;
}
