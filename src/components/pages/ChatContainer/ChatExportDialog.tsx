import type {ReactNode} from 'react';

import {Button, Checkbox, Dialog, Flex, useUniqId} from '@gravity-ui/uikit';

import {i18n} from './i18n';

export interface ChatExportDialogProps {
    open: boolean;
    disabled: boolean;
    messages: {index: number; text: string; selected: boolean}[];
    onSelectAll: (checked: boolean) => void;
    onSelectionChange: (index: number, checked: boolean) => void;
    onClose: () => void;
    onCopy: () => void;
    onDownload: () => void;
    feedback?: ReactNode;
}

/** Present message selection and export actions supplied by the caller. */
export function ChatExportDialog({
    open,
    disabled,
    messages,
    onSelectAll,
    onSelectionChange,
    onClose,
    onCopy,
    onDownload,
    feedback,
}: ChatExportDialogProps) {
    const {t} = i18n.useTranslation();
    const titleId = useUniqId();
    const selectedCount = messages.filter((message) => message.selected).length;
    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose();
            }}
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
                        checked={selectedCount === messages.length}
                        indeterminate={selectedCount > 0 && selectedCount < messages.length}
                        disabled={disabled}
                        onUpdate={onSelectAll}
                    >
                        {t('export-select-all')}
                    </Checkbox>
                    {messages.map(({index, text, selected}) => (
                        <Checkbox
                            key={index}
                            disabled={disabled}
                            checked={selected}
                            onUpdate={(checked) => onSelectionChange(index, checked)}
                        >
                            {text}
                        </Checkbox>
                    ))}
                </Flex>
                {feedback}
            </Dialog.Body>
            <Dialog.Body>
                <Flex gap="spacing-2" wrap="wrap">
                    <Button disabled={disabled || !selectedCount} onClick={onCopy}>
                        {t('export-copy-selected')}
                    </Button>
                    <Button disabled={disabled || !selectedCount} onClick={onDownload}>
                        {t('export-download-selected')}
                    </Button>
                    <Button onClick={onClose}>{t('export-close')}</Button>
                </Flex>
            </Dialog.Body>
        </Dialog>
    );
}
