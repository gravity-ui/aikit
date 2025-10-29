import {CSSProperties} from '@gravity-ui/uikit';
import {block} from '../../../utils/cn';

import './ContextIndicator.scss';

const b = block('context-indicator');

type CommonProps = {
    usedContext: number;
    className?: string;
    qa?: string;
    orientation?: 'horizontal' | 'vertical';
};

type NumberProps = {
    type: 'number';
    maxContext: number;
} & CommonProps;

type PercentProps = {
    type: 'percent';
    usedContext: number;
} & CommonProps;

export type ContextIndicatorProps = NumberProps | PercentProps;

export const ContextIndicator = (props: ContextIndicatorProps) => {
    const {className, qa, orientation = 'horizontal'} = props;

    const percentage =
        props.type === 'number'
            ? Math.round((props.usedContext / props.maxContext) * 100)
            : props.usedContext;

    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    return (
        <div className={b('container', {orientation}, className)} data-qa={qa}>
            <div
                className={b('progress')}
                style={{'--percentage': clampedPercentage} as CSSProperties}
            >
                <div className={b('inner')} />
            </div>
            <div className={b('value')}>{clampedPercentage}</div>
        </div>
    );
};
