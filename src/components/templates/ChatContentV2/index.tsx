'use client';

import {type ReactNode, useCallback, useRef, useState} from 'react';

import {useLayoutEffect} from '@gravity-ui/uikit';
import {flushSync} from 'react-dom';

import {LayoutChangeContext} from '../../../utils/chatLayoutChange';
import {ScrollToBottomButton} from '../../atoms/ScrollToBottomButton';

import './ChatContentV2.scss';

/** @experimental May change or be removed in minor releases. */
export interface ChatContentV2Props {
    header?: ReactNode;
    composer?: ReactNode;
    children?: ReactNode;
    streaming?: boolean;
    waitingForApproval?: boolean;
    className?: string;
    /** Change when prepending history to retain the visible region. */
    historyKey?: string | number;
}

/** @experimental May change or be removed in minor releases. */
export function ChatContentV2({
    header,
    composer,
    children,
    streaming = false,
    waitingForApproval = false,
    className,
    historyKey,
}: ChatContentV2Props) {
    const viewport = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const footer = useRef<HTMLDivElement>(null);
    const following = useRef(true);
    const scrollTarget = useRef<number>();
    const previous = useRef({historyKey, height: 0});
    const [scrolled, setScrolled] = useState(false);
    const [away, setAway] = useState(false);
    const [height, setHeight] = useState(0);
    const update = useCallback(() => {
        const el = viewport.current;
        if (!el) {
            return;
        }
        setScrolled(el.scrollTop > 0);
        setAway(el.scrollHeight - el.clientHeight - el.scrollTop > 24);
    }, []);
    const followToBottom = useCallback(() => {
        const el = viewport.current;
        if (!el) {
            return;
        }
        // Keep the follow intent until the native animation reaches its original target.
        // Content may have grown in the meantime; reconcile to the latest bottom on arrival.
        if (
            scrollTarget.current !== undefined &&
            el.scrollTop >= Math.min(scrollTarget.current, el.scrollHeight - el.clientHeight) - 1
        ) {
            scrollTarget.current = undefined;
            following.current = true;
        }
        if (following.current) {
            el.scrollTop = el.scrollHeight;
        }
    }, []);
    const cancelScrollToBottom = useCallback(() => {
        if (scrollTarget.current === undefined) {
            return;
        }
        scrollTarget.current = undefined;
        following.current = false;
        const el = viewport.current;
        if (el) {
            el.scrollTo({top: el.scrollTop, behavior: 'auto'});
        }
    }, []);
    const preserve = useCallback(
        (change: () => void) => {
            const el = viewport.current;
            const top = el?.scrollTop ?? 0;
            cancelScrollToBottom();
            following.current = false;
            flushSync(change);
            if (el) {
                el.scrollTop = top;
            }
            update();
        },
        [cancelScrollToBottom, update],
    );
    useLayoutEffect(() => {
        const el = viewport.current;
        if (!el) {
            return;
        }
        if (previous.current.historyKey !== historyKey) {
            cancelScrollToBottom();
            el.scrollTop += el.scrollHeight - previous.current.height;
        } else {
            followToBottom();
        }
        previous.current = {historyKey, height: el.scrollHeight};
        update();
    }, [children, historyKey, height, cancelScrollToBottom, followToBottom, update]);
    useLayoutEffect(() => {
        const observer = new ResizeObserver(() => {
            setHeight(footer.current?.offsetHeight ?? 0);
            const el = viewport.current;
            followToBottom();
            if (el) {
                previous.current.height = el.scrollHeight;
            }
            update();
        });
        if (viewport.current) {
            observer.observe(viewport.current);
        }
        if (content.current) {
            observer.observe(content.current);
        }
        if (footer.current) {
            observer.observe(footer.current);
        }
        return () => observer.disconnect();
    }, [followToBottom, update]);
    return (
        <LayoutChangeContext.Provider value={preserve}>
            <div className={`g-aikit-chat-content-v2 ${className ?? ''}`}>
                {header && <div className="g-aikit-chat-content-v2__header">{header}</div>}
                <div className="g-aikit-chat-content-v2__body">
                    {scrolled && <div className="g-aikit-chat-content-v2__top-fade" />}
                    <div
                        ref={viewport}
                        className="g-aikit-chat-content-v2__viewport"
                        onWheel={cancelScrollToBottom}
                        onTouchStart={cancelScrollToBottom}
                        onPointerDown={cancelScrollToBottom}
                        onKeyDown={(event) => {
                            if (
                                [
                                    'ArrowUp',
                                    'ArrowDown',
                                    'PageUp',
                                    'PageDown',
                                    'Home',
                                    'End',
                                    ' ',
                                ].includes(event.key)
                            ) {
                                cancelScrollToBottom();
                            }
                        }}
                        onScroll={() => {
                            const el = viewport.current;
                            if (!el) {
                                return;
                            }
                            if (scrollTarget.current === undefined) {
                                following.current =
                                    el.scrollHeight - el.clientHeight - el.scrollTop <= 24;
                            } else {
                                followToBottom();
                            }
                            update();
                        }}
                    >
                        <div ref={content} style={{paddingBottom: height + 28}}>
                            {children}
                        </div>
                    </div>
                    <div ref={footer} className="g-aikit-chat-content-v2__composer">
                        {composer}
                    </div>
                    {away && (
                        <ScrollToBottomButton
                            streaming={streaming}
                            waitingForApproval={waitingForApproval}
                            className="g-aikit-chat-content-v2__down"
                            style={{bottom: height + 12}}
                            onClick={() => {
                                const el = viewport.current;
                                if (el) {
                                    following.current = false;
                                    scrollTarget.current = el.scrollHeight - el.clientHeight;
                                    el.scrollTo({
                                        top: el.scrollHeight,
                                        behavior: window.matchMedia(
                                            '(prefers-reduced-motion: reduce)',
                                        ).matches
                                            ? 'auto'
                                            : 'smooth',
                                    });
                                    followToBottom();
                                }
                                update();
                            }}
                        />
                    )}
                </div>
            </div>
        </LayoutChangeContext.Provider>
    );
}

export {useChatLayoutChange} from '../../../utils/chatLayoutChange';
