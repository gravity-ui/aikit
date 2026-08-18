import {block} from '../../../utils/cn';
import {ChatDate} from '../../atoms/ChatDate';

const b = block('history');

/**
 * Props for DateHeaderItem component
 */
export interface DateHeaderItemProps {
    date: string;
    format?: string;
}

/**
 * Date header component for grouping chats
 *
 * @returns React element
 */
export function DateHeaderItem({date, format}: DateHeaderItemProps) {
    return (
        <div className={b('date-header')}>
            <ChatDate date={new Date(date)} format={format} relative />
        </div>
    );
}
