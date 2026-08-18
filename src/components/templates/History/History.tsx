import {Popup, Sheet, useMobile, useUniqId} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import {HistoryList, type HistoryListProps} from './HistoryList';
import {i18n} from './i18n';

import './History.scss';

const b = block('history');

/**
 * Props for the History component
 */
export interface HistoryProps extends Omit<HistoryListProps, 'onChatClick'> {
    /** Control popup open state */
    open?: boolean;
    /** Callback when popup open state changes */
    onOpenChange?: (open: boolean) => void;
    /** Anchor element for the popup */
    anchorElement: HTMLElement | null;
}

/**
 * History component - wraps HistoryList in a Popup, and in a bottom Sheet in mobile mode
 *
 * @param props - Component props
 * @returns React component
 */
export function History(props: HistoryProps) {
    const {open = false, onOpenChange, anchorElement, ...listProps} = props;
    const isMobile = useMobile();
    const sheetId = useUniqId();

    const handleChatClick = () => {
        onOpenChange?.(false);
    };

    const list = <HistoryList {...listProps} onChatClick={handleChatClick} />;

    if (isMobile) {
        return (
            <Sheet
                id={sheetId}
                title={i18n('sheet-title')}
                visible={open}
                onClose={() => onOpenChange?.(false)}
                contentClassName={b('sheet-content')}
                qa="history-sheet"
                allowHideOnContentScroll
            >
                {list}
            </Sheet>
        );
    }

    return (
        <Popup
            anchorElement={anchorElement}
            placement="bottom-end"
            open={open}
            onOpenChange={onOpenChange}
        >
            {list}
        </Popup>
    );
}
