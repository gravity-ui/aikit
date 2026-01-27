import {useCallback, useMemo, useState} from 'react';

import type {ThinkingMessageContentData} from '../../../types/messages';
import {copyToClipboard} from '../../../utils';

import {i18n} from './i18n';

export function useThinkingMessage(options: ThinkingMessageContentData) {
    const {
        defaultExpanded = true,
        showStatusIndicator = true,
        status,
        content,
        onCopyClick,
        enabledCopy = false,
    } = options;

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

    const handleCopy = useCallback(() => {
        if (onCopyClick) {
            // Priority 1: Use custom handler for backward compatibility
            onCopyClick();
        } else if (enabledCopy) {
            // Priority 2: Use default copy logic
            copyToClipboard(content);
        }
    }, [onCopyClick, enabledCopy, content]);

    const showCopyButton = Boolean(onCopyClick || enabledCopy);

    return {
        isExpanded,
        toggleExpanded,
        buttonTitle,
        content: contentArray,
        showLoader: showStatusIndicator && status === 'thinking',
        handleCopy,
        showCopyButton,
    };
}
