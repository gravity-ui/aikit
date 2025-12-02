import {cn} from '../../utils/cn';

import './ShowcaseItem.scss';

interface ShowcaseItemProps {
    title: string;
    children: React.ReactNode;
    width?: string | number;
}

const b = cn('showcase-item');

export function ShowcaseItem({title, children, width}: ShowcaseItemProps) {
    return (
        <div className={b()} style={{width}}>
            <div className={b('title')}>{title}</div>
            <div className={b('content')}>{children}</div>
        </div>
    );
}
