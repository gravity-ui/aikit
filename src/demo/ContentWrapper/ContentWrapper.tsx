import {cn} from '../../utils/cn';

import './ContentWrapper.scss';

const b = cn('content-wrapper');

type Props = React.PropsWithChildren<{
    width?: string;
    height?: string;
}>;

export function ContentWrapper({children, width, height}: Props) {
    return (
        <div className={b()} style={{width, height}}>
            {children}
        </div>
    );
}
