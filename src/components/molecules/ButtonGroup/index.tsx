import {block} from '../../../utils/cn';

import './ButtonGroup.scss';

const b = block('button-group');

export type ButtonGroupProps = {
    size?: 'xs' | 's' | 'm';
    orientation?: 'horizontal' | 'vertical';
    children: React.ReactNode;
    className?: string;
    qa?: string;
};

export const ButtonGroup = (props: ButtonGroupProps) => {
    const {size = 's', orientation = 'horizontal', className, qa, children} = props;

    return (
        <div className={b({size, or: orientation}, className)} data-qa={qa}>
            {children}
        </div>
    );
};
