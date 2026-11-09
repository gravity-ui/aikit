import {useEffect, useMemo, useRef, useState} from 'react';

import {Alert, Button, Checkbox, Dialog, Flex, useUniqId} from '@gravity-ui/uikit';

import {
    downloadChatMarkdown,
    getMessageMarkdown,
    serializeChatMarkdown,
} from '../../../utils/chatMarkdown';
import {copyToClipboard} from '../../../utils/clipboardUtils';
import {Header, type HeaderProps} from '../../organisms/Header';

import {i18n} from './i18n';
import type {ChatContainerProps} from './types';

/** Mounted per conversation so selection and asynchronous feedback cannot cross chat boundaries. */
export function ChatExportHeader({
    headerProps,
    messages = [],
    status,
    config,
}: {
    headerProps: HeaderProps;
    messages: ChatContainerProps['messages'];
    status: ChatContainerProps['status'];
    config: NonNullable<ChatContainerProps['chatExport']>;
}) {
    const {t} = i18n.useTranslation();
    const titleId = useUniqId();
    const mounted = useRef(false);
    const inFlight = useRef(false);
    const [pending, setPending] = useState(false);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [notice, setNotice] = useState<{error: boolean; text: string}>();
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    const options = useMemo(
        () => ({
            ...config,
            roleLabels: config.roleLabels ?? {
                user: t('export-user'),
                assistant: t('export-assistant'),
            },
        }),
        [config, t],
    );
    const entries = useMemo(
        () =>
            messages.flatMap((message, index) => {
                const text = getMessageMarkdown(message, options);
                return text ? [{index, message, text}] : [];
            }),
        [messages, options],
    );
    const disabled =
        pending || config.loading || (status !== 'ready' && status !== 'error') || !entries.length;
    const selectedEntries = entries.filter(({index}) => selected.has(index));
    // Close selection when the history changes, rather than apply indices to different messages.
    useEffect(() => {
        setOpen(false);
        setSelected(new Set());
    }, [messages]);

    const run = async (action: 'copy' | 'download', selection = entries) => {
        if (disabled || inFlight.current || !selection.length) return;
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
            if (mounted.current)
                setNotice({
                    error: false,
                    text: t(action === 'copy' ? 'export-copied' : 'export-downloaded'),
                });
        } catch {
            if (mounted.current)
                setNotice({
                    error: true,
                    text: t(action === 'copy' ? 'export-copy-error' : 'export-download-error'),
                });
        } finally {
            inFlight.current = false;
            if (mounted.current) setPending(false);
        }
    };
    const feedback = notice && (
        <div role="status">
            <Alert
                theme={notice.error ? 'danger' : 'success'}
                message={notice.text}
                onClose={() => setNotice(undefined)}
            />
        </div>
    );
    return (
        <>
            <Header
                {...headerProps}
                menuItems={[
                    ...(headerProps.menuItems ?? []),
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
                ]}
            />
            {!open && feedback}
            <Dialog
                open={open}
                onOpenChange={setOpen}
                aria-labelledby={titleId}
                maxWidth="m"
                fullWidth
            >
                <Dialog.Header caption={t('export-select')} id={titleId} />
                <Dialog.Body>
                    <Flex
                        direction="column"
                        gap="spacing-3"
                        style={{maxHeight: '60vh', overflow: 'auto', overflowWrap: 'anywhere'}}
                    >
                        <Checkbox
                            checked={selectedEntries.length === entries.length}
                            indeterminate={
                                selectedEntries.length > 0 &&
                                selectedEntries.length < entries.length
                            }
                            disabled={disabled}
                            onUpdate={(checked) =>
                                setSelected(new Set(checked ? entries.map(({index}) => index) : []))
                            }
                        >
                            {t('export-select-all')}
                        </Checkbox>
                        {entries.map(({index, message, text}) => (
                            <Checkbox
                                key={index}
                                disabled={disabled}
                                checked={selected.has(index)}
                                onUpdate={(checked) =>
                                    setSelected((previous) => {
                                        const next = new Set(previous);
                                        if (checked) next.add(index);
                                        else next.delete(index);
                                        return next;
                                    })
                                }
                            >
                                {options.roleLabels[message.role]}: {text}
                            </Checkbox>
                        ))}
                    </Flex>
                    {feedback}
                </Dialog.Body>
                <Dialog.Body>
                    <Flex gap="spacing-2" wrap="wrap">
                        <Button
                            disabled={disabled || !selectedEntries.length}
                            onClick={() => {
                                run('copy', selectedEntries);
                            }}
                        >
                            {t('export-copy-selected')}
                        </Button>
                        <Button
                            disabled={disabled || !selectedEntries.length}
                            onClick={() => {
                                run('download', selectedEntries);
                            }}
                        >
                            {t('export-download-selected')}
                        </Button>
                        <Button onClick={() => setOpen(false)}>{t('export-close')}</Button>
                    </Flex>
                </Dialog.Body>
            </Dialog>
        </>
    );
}
