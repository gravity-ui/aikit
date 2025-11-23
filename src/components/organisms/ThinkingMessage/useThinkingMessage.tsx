import {useCallback, useMemo, useState} from 'react';

import type {ThinkingMessageContentData} from '../../../types/messages';

import {i18n} from './i18n';

export function useThinkingMessage(options: ThinkingMessageContentData) {
    const {defaultExpanded = true, showStatusIndicator = true, status, content} = options;

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
