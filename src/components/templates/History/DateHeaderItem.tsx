import {DateLocaleConfig} from '../../../hooks';
import {block} from '../../../utils/cn';
import {ChatDate} from '../../atoms/ChatDate';

const b = block('history');

/**
 * Props for DateHeaderItem component
 */
export interface DateHeaderItemProps {
    date: string;
    format?: string;
    locale?: string;
    localeConfig?: DateLocaleConfig;
}

/**
 * Date header component for grouping chats
 *
 * @returns React element
 */
export function DateHeaderItem({date, format, locale, localeConfig}: DateHeaderItemProps) {
    return (
        <div className={b('date-header')}>
            <ChatDate
                date={new Date(date)}
                format={format}
                locale={locale}
                localeConfig={localeConfig}
                relative
            />
        </div>
    );
}
