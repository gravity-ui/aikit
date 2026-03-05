import {Popup} from '@gravity-ui/uikit';

import {HistoryList, type HistoryListProps} from './HistoryList';

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
 * History component - wraps HistoryList in a Popup
 *
 * @param props - Component props
 * @returns React component
 */
export function History(props: HistoryProps) {
    const {open = false, onOpenChange, anchorElement, ...listProps} = props;

    const handleChatClick = () => {
        onOpenChange?.(false);
    };

    return (
        <Popup
            anchorElement={anchorElement}
            placement="bottom-end"
            open={open}
            onOpenChange={onOpenChange}
        >
            <HistoryList {...listProps} onChatClick={handleChatClick} />
        </Popup>
    );
}
