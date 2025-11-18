import {block} from '../../../utils/cn';
import {ChatDate} from '../../atoms/ChatDate';

const b = block('history');

/**
 * Props for DateHeaderItem component
 */
export interface DateHeaderItemProps {
    date: string;
}

/**
 * Date header component for grouping chats
 *
 * @returns React element
 */
export function DateHeaderItem({date}: DateHeaderItemProps) {
    return (
        <div className={b('date-header')}>
            <ChatDate date={new Date(date)} relative />
        </div>
    );
}
