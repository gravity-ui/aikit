import {useCallback, useMemo, useState} from 'react';

import type {ThinkingMessagePart} from '../../../types/messages';
import {BaseMessageAction} from '../../molecules/BaseMessage';

import {i18n} from './i18n';

export type ThinkingMessageData = Omit<ThinkingMessagePart, 'type'>;

export type UseThinkingMessageOptions = ThinkingMessageData & {
    defaultExpanded?: boolean;
    showStatusIndicator?: boolean;
};

export type ThinkingMessageAction = {
    type: BaseMessageAction | string;
    onClick: () => void;
};

export function useThinkingMessage(options: UseThinkingMessageOptions) {
    const {defaultExpanded = true, showStatusIndicator = true, data} = options;
    const {status, content} = data;

    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const buttonTitle = useMemo(() => {
        return i18n(`title-${status}`);
    }, [status]);

    const contentArray = useMemo(() => {
        return Array.isArray(content) ? content : [content];
    }, [content]);

    const toggleExpanded = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    return {
        isExpanded,
        toggleExpanded,
        buttonTitle,
        content: contentArray,
        showLoader: showStatusIndicator && status === 'thinking',
    };
}
