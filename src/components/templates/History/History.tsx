import {Popup, type PopupProps, Sheet, useMobile, useUniqId} from '@gravity-ui/uikit';

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
    /**
     * Keep the keyboard focus inside the desktop popup while it is open (default: `true`).
     *
     * The popup is rendered in a portal, so without focus management `Tab` from the trigger
     * button walks through the rest of the page instead of entering the popup, and the chat
     * list cannot be reached from the keyboard at all.
     */
    modal?: boolean;
    /** The element to focus when the desktop popup opens (default: the popup itself) */
    initialFocus?: PopupProps['initialFocus'];
}

/**
 * History component - wraps HistoryList in a Popup, and in a bottom Sheet in mobile mode
 *
 * @param props - Component props
 * @returns React component
 */
export function History(props: HistoryProps) {
    const {
        open = false,
        onOpenChange,
        anchorElement,
        showSheetTitle = true,
        modal = true,
        initialFocus,
        ...listProps
    } = props;
    const isMobile = useMobile();
    const sheetId = useUniqId();
    const {isKeyboardOpen} = useSheetKeyboardFit(isMobile && open, `.${b('sheet')}`);

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
                className={b('sheet')}
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
            modal={modal}
            initialFocus={initialFocus}
            aria-label={i18n('sheet-title')}
        >
            {list}
        </Popup>
    );
}
