import React from 'react';

import {block} from '../../../utils/cn';
import {StarRating} from '../StarRating';

import './RatingBlock.scss';

const b = block('rating-block');

export type RatingBlockProps = {
    /** Title text or React element (e.g., with links) */
    title?: React.ReactNode;
    /** Rating value (1-5) */
    value?: number;
    /** Rating change callback */
    onChange: (rating: number) => void;
    /** Star size (default: 'l' for visibility) */
    size?: 's' | 'm' | 'l';
    /** Controls visibility (default: true) */
    visible?: boolean;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * RatingBlock - Universal rating block with title and star rating
 *
 * Can be used for customer satisfaction surveys (CSAT), product reviews,
 * article/video ratings, teacher evaluations, or any feedback collection.
 *
 * @example
 * ```tsx
 * <RatingBlock
 *   title="Rate the assistant response:"
 *   value={rating}
 *   onChange={setRating}
 *   size="l"
 * />
 * ```
 * @returns {JSX.Element} Rating block component
 */
export function RatingBlock({title, value, onChange, size = 'l', className, qa}: RatingBlockProps) {
    return (
        <div className={b(null, className)} data-qa={qa}>
            <div className={b('header')}>
                <div className={b('left')}>
                    {title && <div className={b('title')}>{title}</div>}
                </div>
                <div className={b('right')}>
                    <StarRating value={value} onChange={onChange} size={size} qa={qa} />
                </div>
            </div>
        </div>
    );
}
