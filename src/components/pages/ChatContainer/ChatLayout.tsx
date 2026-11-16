import type {ReactNode, RefObject} from 'react';

import {block} from '../../../utils/cn';

const b = block('chat-container');

/** Shared furniture for welcome, conversation, and secondary screens. */
export function ChatLayout({
    header,
    content,
    footer,
    view,
    hidden = false,
    headerRef,
    footerRef,
    headerClassName,
    contentClassName,
    footerClassName,
}: {
    header: ReactNode;
    content: ReactNode;
    footer?: ReactNode;
    view: 'empty' | 'chat' | 'screen';
    hidden?: boolean;
    headerRef?: RefObject<HTMLDivElement>;
    footerRef?: RefObject<HTMLDivElement>;
    headerClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
}) {
    return (
        <div className={b('view')} hidden={hidden}>
            <div className={b('header', headerClassName)} ref={headerRef}>
                {header}
            </div>
            <div className={b('content', {view}, contentClassName)}>{content}</div>
            {footer && (
                <div className={b('footer', {view}, footerClassName)} ref={footerRef}>
                    {footer}
                </div>
            )}
        </div>
    );
}
