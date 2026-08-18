import {Fragment} from 'react';

import {DOMProps, QAProps, useMobile} from '@gravity-ui/uikit';

import {useDateFormatter} from '../../../hooks';
import {block} from '../../../utils/cn';

import {i18n} from './i18n';

import './ChatDate.scss';

const b = block('chat-date');

export type ChatDateProps = QAProps &
    DOMProps & {
        /** Date value in string, Date, or number (timestamp) format */
        date: string | Date | number;
        /** Show time along with date */
        showTime?: boolean;
        /** Custom format string (dayjs format) */
        format?: string;
        /** Locale for date formatting */
        locale?: string;
        /** Display relative dates (today, yesterday, two days ago, etc.) */
        relative?: boolean;
    };

/**
 * ChatDate component displays formatted dates with optional time
 *
 * @param props - Component props
 * @returns React component
 */
export function ChatDate(props: ChatDateProps) {
    const {date, showTime = false, format, locale, className, qa, relative = false, style} = props;

    const isMobile = useMobile();

    const {formattedDate, formattedTime, fullDate, dateObject, isValid, diffDays} =
        useDateFormatter({
            date,
            format,
            locale,
        });

    if (!isValid || !dateObject) {
        return i18n('invalid-date');
    }

    return (
        <time
            className={b({mobile: isMobile}, className)}
            dateTime={dateObject.toISOString()}
            title={fullDate}
            data-qa={qa}
            style={style}
        >
            {relative && typeof diffDays === 'number' ? (
                <span>{i18n('ago', {count: diffDays})}</span>
            ) : (
                <Fragment>
                    <span>{formattedDate}</span>
                    <span>{showTime && formattedTime && ` ${formattedTime}`}</span>
                </Fragment>
            )}
        </time>
    );
}
