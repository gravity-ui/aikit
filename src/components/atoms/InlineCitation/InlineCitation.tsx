import React, {useCallback, useEffect, useId, useRef, useState} from 'react';

import {ChevronLeft, ChevronRight, Xmark} from '@gravity-ui/icons';
import {Button, Icon, Link, Popup} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import {i18n} from './i18n';

import './InlineCitation.scss';

const b = block('inline-citation');

export interface InlineCitationSource {
    /** Stable identifier, unique within this citation. */
    id: string;
    /** Absolute HTTP or HTTPS URL. Other URLs are displayed without a link. */
    url: string;
    title?: string;
    description?: string;
    quote?: string;
}

export interface InlineCitationProps {
    sources: readonly InlineCitationSource[];
    /** Overrides the first source's hostname in the trigger. */
    label?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Call event.preventDefault() to override navigation. */
    onSourceClick?: (
        source: InlineCitationSource,
        event: React.MouseEvent<HTMLAnchorElement>,
    ) => void;
    className?: string;
    qa?: string;
}

function getSourceUrl(url: string) {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

export function InlineCitation({
    sources,
    label,
    open,
    defaultOpen = false,
    onOpenChange,
    onSourceClick,
    className,
    qa,
}: InlineCitationProps) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const [interactive, setInteractive] = useState(defaultOpen);
    const [triggerElement, setTriggerElement] = useState<HTMLButtonElement | null>(null);
    const [selectedId, setSelectedId] = useState<string>();
    const [cardLayout, setCardLayout] = useState({above: false, availableHeight: 480});
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();
    const pinnedRef = useRef(defaultOpen);
    const suppressFocusRef = useRef(false);
    const cardId = useId();
    const titleId = useId();
    const setTriggerRef = useCallback((element: HTMLButtonElement | null) => {
        triggerRef.current = element;
        setTriggerElement(element);
    }, []);
    const isOpen = (open ?? internalOpen) && sources.length > 0;
    const selectedIndex = Math.max(
        0,
        sources.findIndex((source) => source.id === selectedId),
    );
    const source = sources[selectedIndex];

    const clearTimer = useCallback(() => {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
    }, []);

    useEffect(() => clearTimer, [clearTimer]);

    useEffect(() => {
        if (!isOpen || !triggerElement) {
            return undefined;
        }
        const updateLayout = () => {
            const rect = triggerElement.getBoundingClientRect();
            const above = rect.top;
            const below = window.innerHeight - rect.bottom;
            setCardLayout({
                above: above > below,
                availableHeight: Math.max(0, Math.max(above, below) - 16),
            });
        };
        updateLayout();
        window.addEventListener('resize', updateLayout);
        window.addEventListener('scroll', updateLayout, true);
        return () => {
            window.removeEventListener('resize', updateLayout);
            window.removeEventListener('scroll', updateLayout, true);
        };
    }, [isOpen, triggerElement]);

    useEffect(() => {
        if (!isOpen) {
            clearTimer();
            pinnedRef.current = false;
            setInteractive(false);
        }
    }, [isOpen, clearTimer]);

    const changeOpen = (nextOpen: boolean) => {
        clearTimer();
        if (!nextOpen) {
            pinnedRef.current = false;
            suppressFocusRef.current = Boolean(cardRef.current?.contains(document.activeElement));
        }
        if (open === undefined) {
            setInternalOpen(nextOpen);
        }
        if (nextOpen !== isOpen) {
            onOpenChange?.(nextOpen);
        }
    };

    const scheduleClose = () => {
        clearTimer();
        if (pinnedRef.current) {
            return;
        }
        timerRef.current = setTimeout(() => {
            const activeElement = document.activeElement;
            if (activeElement !== triggerRef.current && !cardRef.current?.contains(activeElement)) {
                changeOpen(false);
            }
        }, 200);
    };

    const handlePointerEnter = (event: React.PointerEvent) => {
        clearTimer();
        if (event.pointerType === 'mouse' && !isOpen) {
            timerRef.current = setTimeout(() => changeOpen(true), 150);
        }
    };

    const navigateSource = (nextIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
        if (
            (nextIndex === 0 || nextIndex === sources.length - 1) &&
            document.activeElement === event.currentTarget
        ) {
            // Keep focus in the preview before the active navigation button becomes disabled.
            cardRef.current?.focus();
        }
        setSelectedId(sources[nextIndex].id);
    };

    if (!source) {
        return null;
    }

    const hostname = getSourceUrl(sources[0].url)?.hostname;
    const triggerLabel = label ?? hostname ?? sources[0].title ?? i18n('source');
    const sourceUrl = getSourceUrl(source.url);
    const title = source.title || sourceUrl?.hostname || i18n('source');

    return (
        <span className={b(null, className)} data-qa={qa}>
            <button
                ref={setTriggerRef}
                type="button"
                className={b('trigger')}
                aria-label={i18n('show-sources', {count: sources.length})}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls={isOpen ? cardId : undefined}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={scheduleClose}
                onFocus={() => {
                    if (suppressFocusRef.current) {
                        suppressFocusRef.current = false;
                    } else {
                        changeOpen(true);
                    }
                }}
                onBlur={scheduleClose}
                onClick={() => {
                    if (isOpen && pinnedRef.current) {
                        changeOpen(false);
                    } else {
                        pinnedRef.current = true;
                        setInteractive(true);
                        changeOpen(true);
                    }
                }}
            >
                <span className={b('label')}>{triggerLabel}</span>
                {sources.length > 1 && <span className={b('count')}>+{sources.length - 1}</span>}
            </button>
            <Popup
                open={isOpen}
                anchorElement={triggerElement}
                placement={cardLayout.above ? 'top-start' : 'bottom-start'}
                onOpenChange={changeOpen}
                className={b('popup', className)}
                initialFocus={interactive ? 0 : -1}
                returnFocus={interactive}
                qa={qa ? `${qa}-popup` : undefined}
            >
                <div
                    ref={cardRef}
                    role="dialog"
                    tabIndex={-1}
                    id={cardId}
                    aria-labelledby={titleId}
                    className={b('card')}
                    style={{maxHeight: `min(480px, ${cardLayout.availableHeight}px)`}}
                    onPointerEnter={clearTimer}
                    onPointerLeave={scheduleClose}
                    onFocus={() => {
                        clearTimer();
                        setInteractive(true);
                    }}
                    onBlur={scheduleClose}
                >
                    <div className={b('header')}>
                        {sources.length > 1 && (
                            <>
                                <Button
                                    view="flat-secondary"
                                    size="s"
                                    disabled={selectedIndex === 0}
                                    aria-label={i18n('previous')}
                                    onClick={(event) => navigateSource(selectedIndex - 1, event)}
                                >
                                    <Icon data={ChevronLeft} size={16} />
                                </Button>
                                <span className={b('index')} aria-live="polite" aria-atomic="true">
                                    {selectedIndex + 1} / {sources.length}
                                </span>
                                <Button
                                    view="flat-secondary"
                                    size="s"
                                    disabled={selectedIndex === sources.length - 1}
                                    aria-label={i18n('next')}
                                    onClick={(event) => navigateSource(selectedIndex + 1, event)}
                                >
                                    <Icon data={ChevronRight} size={16} />
                                </Button>
                            </>
                        )}
                        <Button
                            view="flat-secondary"
                            size="s"
                            className={b('close')}
                            aria-label={i18n('close')}
                            onClick={() => changeOpen(false)}
                        >
                            <Icon data={Xmark} size={16} />
                        </Button>
                    </div>
                    <div className={b('source')} key={source.id}>
                        <div id={titleId} className={b('title')}>
                            {sourceUrl ? (
                                <Link
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => onSourceClick?.(source, event)}
                                >
                                    {title}
                                </Link>
                            ) : (
                                title
                            )}
                        </div>
                        <div className={b('url')}>{sourceUrl?.hostname ?? source.url}</div>
                        {source.description && (
                            <div className={b('description')}>{source.description}</div>
                        )}
                        {source.quote && (
                            <blockquote className={b('quote')}>{source.quote}</blockquote>
                        )}
                    </div>
                </div>
            </Popup>
        </span>
    );
}
