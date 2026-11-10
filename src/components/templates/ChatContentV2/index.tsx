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
    const preserve = useCallback(
        (change: () => void) => {
            const el = viewport.current;
            const top = el?.scrollTop ?? 0;
            following.current = false;
            flushSync(change);
            if (el) {
                el.scrollTop = top;
            }
            update();
        },
        [update],
    );
    useLayoutEffect(() => {
        const el = viewport.current;
        if (!el) {
            return;
        }
        if (previous.current.historyKey !== historyKey) {
            el.scrollTop += el.scrollHeight - previous.current.height;
        } else if (following.current) {
            el.scrollTop = el.scrollHeight;
        }
        previous.current = {historyKey, height: el.scrollHeight};
        update();
    }, [children, historyKey, height, update]);
    useLayoutEffect(() => {
        const observer = new ResizeObserver(() => {
            setHeight(footer.current?.offsetHeight ?? 0);
            const el = viewport.current;
            if (el && following.current) {
                el.scrollTop = el.scrollHeight;
            }
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
    }, [update]);
    return (
        <LayoutChangeContext.Provider value={preserve}>
            <div className={`g-aikit-chat-content-v2 ${className ?? ''}`}>
                {header && <div className="g-aikit-chat-content-v2__header">{header}</div>}
                <div className="g-aikit-chat-content-v2__body">
                    {scrolled && <div className="g-aikit-chat-content-v2__top-fade" />}
                    <div
                        ref={viewport}
                        className="g-aikit-chat-content-v2__viewport"
                        onScroll={() => {
                            const el = viewport.current;
                            if (!el) {
                                return;
                            }
                            following.current =
                                el.scrollHeight - el.clientHeight - el.scrollTop <= 24;
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
                                following.current = true;
                                const el = viewport.current;
                                if (el) {
                                    el.scrollTop = el.scrollHeight;
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
