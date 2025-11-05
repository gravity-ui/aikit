import {Button} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './Suggestions.scss';

const b = block('suggestions');

/**
 * Props for the Suggestions component
 */
export type SuggestionsProps = {
    /** Array of suggestion items to display */
    items: {
        /** Optional unique identifier for the item */
        id?: string;
        /** Title text to display on the button */
        title: string;
    }[];
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
    const {items, onClick, layout = 'list', textAlign = 'center', className, qa} = props;

    const handleClick = (item: {id?: string; title: string}) => {
        onClick(item.title, item.id);
    };

    return (
        <div className={b({layout}, className)} data-qa={qa}>
            {items.map((item, index) => (
                <Button
                    key={item.id || index}
                    size="m"
                    view="outlined"
                    onClick={() => handleClick(item)}
                    className={b('button', {layout, 'text-align': textAlign})}
                    width="auto"
                >
                    {item.title}
                </Button>
            ))}
        </div>
    );
}
