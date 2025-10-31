import {Spin} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './Loader.scss';
const b = block('loader');

export type LoaderSize = 's' | 'm' | 'l';

export interface LoaderProps {
    view?: 'streaming' | 'loading';
    size?: LoaderSize;
    className?: string;
    qa?: string;
}

const getSizeForLoading = (size: LoaderSize) => {
    switch (size) {
        case 's':
            return 'xs';
        case 'm':
            return 's';
        case 'l':
            return 'm';
        default:
            return 's';
    }
};

export function Loader({view = 'streaming', size = 'm', className, qa}: LoaderProps) {
    if (view === 'streaming') {
        return (
            <div className={b({size}, className)} data-qa={qa}>
                <div className={b('left')} />
                <div className={b('center')} />
                <div className={b('right')} />
            </div>
        );
    }

    return <Spin size={getSizeForLoading(size)} data-qa={qa} className={b({view})} />;
}
