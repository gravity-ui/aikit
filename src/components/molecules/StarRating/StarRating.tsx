import {useCallback, useState} from 'react';

import {Star, StarFill} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import type {ButtonSize} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {ButtonGroup} from '../ButtonGroup';

import {i18n} from './i18n';

import './StarRating.scss';

const b = block('star-rating');

const STAR_COUNT = 5;

const getButtonSize = (size: StarRatingSize): ButtonSize => {
    if (size === 's') return 'xs';
    if (size === 'm') return 's';
    return 'm';
};

const getIconSize = (size: StarRatingSize): number => {
    if (size === 's') return 16;
    if (size === 'm') return 20;
    return 24;
};

export type StarRatingSize = 's' | 'm' | 'l';

export interface StarRatingProps {
    /**
     * Current rating value (1-5)
     */
    value?: number;
    /**
     * Callback when rating changes
     */
    onChange?: (rating: number) => void;
    /**
     * Disabled state
     */
    disabled?: boolean;
    /**
     * Size variant
     */
    size?: StarRatingSize;
    /**
     * Custom aria-label for accessibility
     */
    'aria-label'?: string;
    /**
     * Custom aria-label formatter for individual stars
     * @param rating - star rating value (1-5)
     */
    'aria-label-star'?: (rating: number) => string;
    /**
     * Additional CSS class
     */
    className?: string;
    /**
     * QA/test identifier
     */
    qa?: string;
}

export function StarRating({
    value,
    onChange,
    disabled = false,
    size = 'l',
    'aria-label': ariaLabel,
    'aria-label-star': ariaLabelStar,
    className,
    qa,
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const handleClick = useCallback(
        (rating: number) => {
            if (!disabled && onChange) {
                onChange(rating);
            }
        },
        [disabled, onChange],
    );

    const handleMouseEnter = useCallback(
        (rating: number) => {
            if (!disabled) {
                setHoverValue(rating);
            }
        },
        [disabled],
    );

    const handleMouseLeave = useCallback(() => {
        setHoverValue(null);
    }, []);

    const displayValue = hoverValue ?? value ?? 0;
    const buttonSize = getButtonSize(size);
    const iconSize = getIconSize(size);

    return (
        <div
            className={b({size, disabled}, className)}
            role="radiogroup"
            aria-label={ariaLabel || i18n('aria-label-group')}
            data-qa={qa}
            onMouseLeave={handleMouseLeave}
        >
            <ButtonGroup>
                {Array.from({length: STAR_COUNT}, (_, index) => {
                    const rating = index + 1;
                    const isFilled = rating <= displayValue;

                    return (
                        <Button
                            key={rating}
                            view="flat-secondary"
                            size={buttonSize}
                            onClick={() => handleClick(rating)}
                            onMouseEnter={() => handleMouseEnter(rating)}
                            disabled={disabled}
                            role="radio"
                            aria-checked={rating === value}
                            aria-label={
                                ariaLabelStar
                                    ? ariaLabelStar(rating)
                                    : i18n('aria-label-star', {rating})
                            }
                            className={b('star', {filled: isFilled})}
                            qa={`star-rating-button-${rating}`}
                        >
                            <Icon data={isFilled ? StarFill : Star} size={iconSize} />
                        </Button>
                    );
                })}
            </ButtonGroup>
        </div>
    );
}
