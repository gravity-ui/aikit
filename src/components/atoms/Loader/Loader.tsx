import {Spin} from '@gravity-ui/uikit';
import {block} from '../../../utils/cn';

import './Loader.scss';
const b = block('loader');

export type LoaderSize = 's' | 'm' | 'l';

export interface LoaderProps {
    view: 'streaming' | 'loading';
    size?: LoaderSize;
    className?: string;
}

export function Loader({view = 'streaming', size = 'm', className}: LoaderProps) {
    if (view === 'streaming') {
        return (
            <div className={b({size}, className)}>
                <div className={b('left')} />
                <div className={b('center')} />
                <div className={b('right')} />
            </div>
        );
    }

    return <Spin size="xs" />;
}
