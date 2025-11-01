import {block} from '../../../utils/cn';

import './Shimmer.scss';

export type ShimmerProps = React.PropsWithChildren<{
    className?: string;
    qa?: string;
}>;

const b = block('shimmer');

export const Shimmer = (props: ShimmerProps) => {
    const {className, qa, children} = props;

    return (
        <div className={b('container', className)} data-qa={qa}>
            {children}
        </div>
    );
};
