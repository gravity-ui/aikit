import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';

import {
    downloadChatMarkdown,
    getMessageMarkdown,
    serializeChatMarkdown,
} from '../../../utils/chatMarkdown';
import {copyToClipboard} from '../../../utils/clipboardUtils';
import type {HeaderMenuItem} from '../../organisms/Header';

import type {ChatExportDialogProps} from './ChatExportDialog';
import {i18n} from './i18n';
import type {ChatContainerProps} from './types';

/** Own export operations and selection for one conversation at a time. */
export function useChatExport({
    conversationKey,
    messages,
    status,
    config,
}: {
    conversationKey: string;
    messages: NonNullable<ChatContainerProps['messages']>;
    status: ChatContainerProps['status'];
    config: ChatContainerProps['chatExport'];
}) {
    const {t} = i18n.useTranslation();
    const enabled = Boolean(config);
    const scope = useMemo(() => ({}), [conversationKey, enabled]);
    const activeScope = useRef<object | null>(null);
    const inFlight = useRef(false);
    const [pending, setPending] = useState(false);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [notice, setNotice] = useState<{error: boolean; text: string}>();
    // Reset before paint and invalidate old operations, including an A -> B -> A switch.
    useLayoutEffect(() => {
        activeScope.current = scope;
        inFlight.current = false;
        setPending(false);
        setOpen(false);
        setSelected((previous) => (previous.size ? new Set() : previous));
        setNotice(undefined);
        return () => {
            activeScope.current = null;
        };
    }, [scope]);
    const options = useMemo(
        () => ({
            ...config,
            roleLabels: config?.roleLabels ?? {
                user: t('export-user'),
                assistant: t('export-assistant'),
            },
        }),
        [config, t],
    );
    const entries = useMemo(
        () =>
            (enabled ? messages : []).flatMap((message, index) => {
                const text = getMessageMarkdown(message, options);
                return text ? [{index, message, text}] : [];
            }),
        [enabled, messages, options],
    );
    const disabled =
        !enabled ||
        pending ||
        config?.loading ||
        (status !== 'ready' && status !== 'error') ||
        !entries.length;
    const selectedEntries = entries.filter(({index}) => selected.has(index));
    // Close selection when the history changes, rather than apply indices to different messages.
    useEffect(() => {
        setOpen(false);
        setSelected((previous) => (previous.size ? new Set() : previous));
    }, [messages]);

    const run = async (action: 'copy' | 'download', selection = entries) => {
        if (!config || disabled || inFlight.current || !selection.length) return;
        inFlight.current = true;
        setPending(true);
        setNotice(undefined);
        try {
            const markdown = serializeChatMarkdown(
                selection.map(({message}) => message),
                options,
            );
            if (action === 'download') {
                downloadChatMarkdown(markdown, config.filename);
            } else if (!copyToClipboard(markdown)) {
                // Prefer the shared synchronous copy path while the user gesture is active.
                // The async API can be restricted in Safari and embedded previews.
                if (!navigator.clipboard?.writeText) {
                    throw new Error('Clipboard copy failed');
                }
                await navigator.clipboard.writeText(markdown);
            }
            if (activeScope.current === scope)
                setNotice({
                    error: false,
                    text: t(action === 'copy' ? 'export-copied' : 'export-downloaded'),
                });
        } catch {
            if (activeScope.current === scope)
                setNotice({
                    error: true,
                    text: t(action === 'copy' ? 'export-copy-error' : 'export-download-error'),
                });
        } finally {
            if (activeScope.current === scope) {
                inFlight.current = false;
                setPending(false);
            }
        }
    };

    const menuItems: HeaderMenuItem[] = enabled
        ? [
              {
                  id: 'chat-export-copy',
                  label: t('export-copy'),
                  disabled,
                  onClick: () => {
                      run('copy');
                  },
              },
              {
                  id: 'chat-export-download',
                  label: t('export-download'),
                  disabled,
                  onClick: () => {
                      run('download');
                  },
              },
              {
                  id: 'chat-export-select',
                  label: t('export-select'),
                  disabled,
                  onClick: () => {
                      setSelected(new Set(entries.map(({index}) => index)));
                      setOpen(true);
                  },
              },
          ]
        : [];
    const dialogProps: ChatExportDialogProps = {
        open,
        disabled: Boolean(disabled),
        messages: entries.map(({index, message, text}) => ({
            index,
            text: `${options.roleLabels[message.role]}: ${text}`,
            selected: selected.has(index),
        })),
        onSelectAll: (checked) =>
            setSelected(new Set(checked ? entries.map(({index}) => index) : [])),
        onSelectionChange: (index, checked) =>
            setSelected((previous) => {
                const next = new Set(previous);
                if (checked) next.add(index);
                else next.delete(index);
                return next;
            }),
        onClose: () => setOpen(false),
        onCopy: () => {
            run('copy', selectedEntries);
        },
        onDownload: () => {
            run('download', selectedEntries);
        },
    };
    return {menuItems, dialogProps, notice, dismissNotice: () => setNotice(undefined)};
}
