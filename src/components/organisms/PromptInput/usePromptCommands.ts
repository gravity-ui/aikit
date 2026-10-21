import {useEffect, useId, useRef, useState} from 'react';
import type {KeyboardEvent, RefObject} from 'react';

import type {
    PromptCommandItem,
    PromptCommandSource,
    PromptCommandsConfig,
    PromptSelection,
} from '../../../types';

import {type CommandMatch, findCommandMatch, replaceCommand} from './commandUtils';

type Session = CommandMatch & {origin: 'input' | 'button'};
const EMPTY_SELECTIONS: readonly PromptSelection[] = [];

export function usePromptCommands({
    config,
    resetKey,
    value,
    onChange,
    inputRef,
    disabled,
    maxLength,
}: {
    config?: PromptCommandsConfig;
    resetKey?: string | number;
    value: string;
    onChange: (value: string) => void;
    inputRef: RefObject<HTMLTextAreaElement>;
    disabled: boolean;
    maxLength?: number;
}) {
    const [internalSelections, setInternalSelections] = useState<PromptSelection[]>([]);
    const selections = config ? (config.selections ?? internalSelections) : EMPTY_SELECTIONS;
    const [session, setSession] = useState<Session>();
    const [result, setResult] = useState<{
        session: Session;
        source: PromptCommandSource;
        items: readonly PromptCommandItem[];
        error?: boolean;
    }>();
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectionError, setSelectionError] = useState(false);
    const suppressed = useRef<string>();
    const selectionRevision = useRef(0);
    const previousResetKey = useRef(resetKey);
    useEffect(() => {
        if (previousResetKey.current === resetKey) return;
        previousResetKey.current = resetKey;
        selectionRevision.current++;
        setInternalSelections([]);
        setSession(undefined);
        setResult(undefined);
        setSelectionError(false);
        suppressed.current = undefined;
    }, [resetKey]);
    const listId = useId();
    const source = config?.sources.find((item) => item.id === session?.sourceId);
    const open = Boolean(session && source && !disabled);
    const items =
        result && result.source === source && result.session === session ? result.items : [];
    const loading = open && (result?.session !== session || result?.source !== source);
    const error =
        selectionError ||
        (result && result.source === source && result.session === session && result.error);
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    const latest = useRef({selections, config});
    if (
        latest.current.selections.length !== selections.length ||
        latest.current.selections.some((item, index) => item !== selections[index])
    ) {
        selectionRevision.current++;
    }
    latest.current = {selections, config};

    const updateSelections = (next: PromptSelection[]) => {
        if (!mounted.current) return;
        selectionRevision.current++;
        latest.current.selections = next;
        setInternalSelections(next);
        latest.current.config?.onSelectionsChange?.(next);
    };
    const clearSubmitted = (submitted: readonly PromptSelection[]) => {
        updateSelections(latest.current.selections.filter((item) => !submitted.includes(item)));
    };
    const close = () => {
        suppressed.current = value;
        setSession(undefined);
    };
    const detect = (text: string, start: number, end: number, edited = false) => {
        if (disabled || !config || (!edited && suppressed.current !== undefined)) return;
        if (edited) suppressed.current = undefined;
        const match = findCommandMatch(text, start, end, config.sources);
        setSession((previous) => {
            if (!match) return undefined;
            if (
                previous?.origin === 'input' &&
                previous.sourceId === match.sourceId &&
                previous.query === match.query &&
                previous.start === match.start &&
                previous.end === match.end
            )
                return previous;
            return {...match, origin: 'input'};
        });
    };
    useEffect(() => {
        if (disabled) setSession(undefined);
    }, [disabled]);
    useEffect(() => {
        if (!session || !source || !open) return undefined;
        const controller = new AbortController();
        setActiveIndex(0);
        setSelectionError(false);
        const load = async () => {
            try {
                const matches = source.getItems
                    ? await source.getItems(session.query, {signal: controller.signal})
                    : (source.items ?? []).filter((item) =>
                          [item.title, item.description, ...(item.keywords ?? [])].some((text) =>
                              text?.toLocaleLowerCase().includes(session.query.toLocaleLowerCase()),
                          ),
                      );
                if (!controller.signal.aborted) {
                    setResult({session, source, items: matches});
                    setActiveIndex(
                        Math.max(
                            0,
                            matches.findIndex((item) => !item.disabled),
                        ),
                    );
                }
            } catch {
                if (!controller.signal.aborted)
                    setResult({session, source, items: [], error: true});
            }
        };
        load();
        return () => controller.abort();
    }, [session, source, open]);

    const select = (item: PromptCommandItem) => {
        if (!session || !source || item.disabled || disabled) return;
        const replacement =
            session.origin === 'button' && item.insertText === undefined
                ? {value, caret: session.start}
                : replaceCommand(value, session, item.insertText);
        if (maxLength !== undefined && replacement.value.length > maxLength) {
            setSelectionError(true);
            return;
        }
        try {
            source.onSelect?.(item, {query: session.query, origin: session.origin});
        } catch {
            setSelectionError(true);
            return;
        }
        if (item.keepSelected !== false) {
            const selection: PromptSelection = {
                sourceId: source.id,
                id: item.id,
                title: item.title,
                ...(item.data && {data: item.data}),
            };
            updateSelections([
                ...selections.filter(
                    (entry) => entry.sourceId !== source.id || entry.id !== item.id,
                ),
                selection,
            ]);
        }
        onChange(replacement.value);
        suppressed.current = replacement.value;
        setSession(undefined);
        requestAnimationFrame(() => {
            const input = inputRef.current;
            if (!input?.isConnected) return;
            input.focus();
            input.setSelectionRange(replacement.caret, replacement.caret);
        });
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (!open || event.nativeEvent.isComposing) return false;
        if (event.key === 'Escape' || event.key === 'Tab') {
            if (event.key === 'Escape') event.preventDefault();
            close();
            return true;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            for (let step = 1; step <= items.length; step++) {
                const index = (activeIndex + direction * step + items.length) % items.length;
                if (!items[index].disabled) {
                    setActiveIndex(index);
                    break;
                }
            }
            return true;
        }
        if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            if (items[activeIndex]) select(items[activeIndex]);
            return true;
        }
        return false;
    };
    return {
        selections,
        clearSubmitted,
        captureSubmission: () => {
            const submitted = [...latest.current.selections];
            clearSubmitted(submitted);
            let expectedRevision = selectionRevision.current;
            return {
                selections: submitted,
                hasChanged: () => selectionRevision.current !== expectedRevision,
                restore: () => {
                    updateSelections(submitted);
                    expectedRevision = selectionRevision.current;
                },
                clear: () => clearSubmitted(submitted),
            };
        },
        open,
        source,
        session,
        items,
        loading,
        error,
        listId,
        activeIndex,
        select,
        close,
        handleKeyDown,
        detect,
        remove: (selection: PromptSelection) =>
            updateSelections(selections.filter((item) => item !== selection)),
        openSource: (sourceId: string) => {
            if (disabled) return;
            const start = inputRef.current?.selectionStart ?? value.length;
            const end = inputRef.current?.selectionEnd ?? start;
            setSession({sourceId, query: '', start, end, origin: 'button'});
        },
        search: (query: string) =>
            setSession((previous) => (previous ? {...previous, query} : previous)),
        retry: () => setSession((previous) => (previous ? {...previous} : previous)),
    };
}
