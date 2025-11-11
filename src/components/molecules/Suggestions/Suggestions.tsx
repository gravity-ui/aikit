import {ChevronLeft, ChevronRight} from '@gravity-ui/icons';
import {ButtonButtonProps, Icon, Text} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms';

import './Suggestions.scss';

const b = block('suggestions');

export type SuggestionsItem = {
    /** Optional unique identifier for the item */
    id?: string;
    /** Title text to display on the button */
    title: string;
    /** Button view */
    view?: ButtonButtonProps['view'];
    /** Icon position: 'left' for ChevronLeft, 'right' for ChevronRight */
    icon?: 'left' | 'right';
};

/**
 * Props for the Suggestions component
 */
export type SuggestionsProps = {
    /** Array of suggestion items to display */
    items: SuggestionsItem[];
    /** Callback function called when a suggestion is clicked */
    onClick: (content: string, id?: string) => void | Promise<void>;
    /** Layout orientation: 'grid' for horizontal, 'list' for vertical */
    layout?: 'grid' | 'list';
    /** Text alignment inside buttons: 'left', 'center', or 'right' */
    textAlign?: 'left' | 'center' | 'right';
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * Suggestions component displays a group of clickable suggestion buttons
 * arranged in either horizontal (grid) or vertical (list) layout
 *
 * @param props - Component props
 * @returns React component
 */
export function Suggestions(props: SuggestionsProps) {
    const {items, onClick, layout = 'list', textAlign = 'left', className, qa} = props;

    const handleClick = (item: {id?: string; title: string}) => {
        onClick(item.title, item.id);
    };

    const renderButton = (item: SuggestionsItem, index: number) => {
        return (
            <ActionButton
                key={item.id || index}
                tooltipTitle={item.title}
                size="m"
                view={item.view || 'outlined'}
                onClick={() => handleClick(item)}
                className={b('button', {layout})}
                width="auto"
            >
                <div
                    className={b('button-content', {
                        layout,
                        'text-align': item.icon ? undefined : textAlign,
                    })}
                >
                    {item.icon === 'left' && (
                        <div className={b('button-icon')}>
                            <Icon data={ChevronLeft} size={16} />
                        </div>
                    )}
                    <Text as="div" className={b('button-text')}>
                        {item.title}
                    </Text>
                    {item.icon === 'right' && (
                        <div className={b('button-icon')}>
                            <Icon data={ChevronRight} size={16} />
                        </div>
                    )}
                </div>
            </ActionButton>
        );
    };

    return (
        <div className={b({layout}, className)} data-qa={qa}>
            {items.map((item, index) => renderButton(item, index))}
        </div>
    );
}
