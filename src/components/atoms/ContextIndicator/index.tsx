import {CSSProperties, ReactNode} from 'react';

import {Tooltip} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import {getProgressColor} from './utils';

import './ContextIndicator.scss';

const b = block('context-indicator');

type CommonProps = {
    usedContext: number;
    className?: string;
    qa?: string;
    orientation?: 'horizontal' | 'vertical';
    reversed?: boolean;
    /** Content to show on hover in a tooltip */
    tooltipContent?: ReactNode;
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
    const {className, qa, orientation = 'horizontal', reversed = false, tooltipContent} = props;

    const percentage =
        props.type === 'number'
            ? Math.round((props.usedContext / props.maxContext) * 100)
            : props.usedContext;

    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    const content = (
        <div className={b('container', {orientation, reversed}, className)} data-qa={qa}>
            <div
                className={b('progress')}
                style={
                    {
                        '--percentage': clampedPercentage,
                        '--progress-color': getProgressColor(clampedPercentage),
                    } as CSSProperties
                }
            >
                <div className={b('inner')} />
            </div>
            <div className={b('value')}>{clampedPercentage}</div>
        </div>
    );

    if (tooltipContent) {
        return <Tooltip content={tooltipContent}>{content}</Tooltip>;
    }

    return content;
};
