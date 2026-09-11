import {Popup, Sheet, useMobile, useUniqId} from '@gravity-ui/uikit';

import {useSheetKeyboardFit} from '../../../hooks/useSheetKeyboardFit';
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
    /** Show the mobile sheet title (default: `true`); it stays in `aria-label` either way */
    showSheetTitle?: boolean;
}

/**
 * History component - wraps HistoryList in a Popup, and in a bottom Sheet in mobile mode
 *
 * @param props - Component props
 * @returns React component
 */
export function History(props: HistoryProps) {
    const {open = false, onOpenChange, anchorElement, showSheetTitle = true, ...listProps} = props;
    const isMobile = useMobile();
    const sheetId = useUniqId();
    // Searching through the chats raises the on-screen keyboard, which leaves the sheet hanging
    // below it - the sheet is measured against the layout viewport, and that one does not shrink.
    const {isKeyboardOpen} = useSheetKeyboardFit(isMobile);

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
                className={b('sheet', {'keyboard-open': isKeyboardOpen})}
                contentClassName={b('sheet-content', {
                    'without-title': !showSheetTitle,
                    'keyboard-open': isKeyboardOpen,
                })}
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
