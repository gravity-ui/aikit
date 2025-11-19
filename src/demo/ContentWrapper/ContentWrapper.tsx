import {cn} from '../../utils/cn';

import './ContentWrapper.scss';

const b = cn('content-wrapper');

type Props = React.PropsWithChildren<React.CSSProperties>;

export function ContentWrapper(props: Props) {
    const {children, ...style} = props;
    return (
        <div className={b()} style={style}>
            {children}
        </div>
    );
}
