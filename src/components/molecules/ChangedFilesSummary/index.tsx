'use client';

import {type ReactNode, useState} from 'react';

import {ArrowRotateLeft, Eye} from '@gravity-ui/icons';
import {Button, Icon, Popup, useUniqId} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {DiffStat} from '../../atoms/DiffStat';

import './ChangedFilesSummary.scss';

const b = block('changed-files-summary');

export interface ChangedFile {
    id: string;
    path: string;
    added: number;
    deleted: number;
}

export interface ChangedFilesSummaryProps {
    /** Final per-file differences against the host's baseline, not tool-call deltas. */
    files: readonly ChangedFile[];
    view?: 'pill' | 'card';
    onViewChanges?: () => void;
    onUndo?: () => void;
    viewChangesLabel?: string;
    undoLabel?: string;
    label?: ReactNode;
    title?: string;
    disabled?: boolean;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Only render file actions when the host supplies a real action. */
    onFileClick?: (file: ChangedFile) => void;
    className?: string;
    qa?: string;
}

export function ChangedFilesSummary({
    files,
    view = 'pill',
    onViewChanges,
    onUndo,
    viewChangesLabel = 'View changes',
    undoLabel = 'Undo',
    label,
    title = 'Changed files',
    disabled = false,
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    onFileClick,
    className,
    qa,
}: ChangedFilesSummaryProps) {
    const [localOpen, setLocalOpen] = useState(defaultOpen);
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
    const popupId = useUniqId();
    const isDisabled = disabled || files.length === 0;
    const open = (controlledOpen ?? localOpen) && !isDisabled;
    const changeOpen = (value: boolean) => {
        setLocalOpen(value);
        onOpenChange?.(value);
    };
    const totals = files.reduce(
        (sum, file) => ({added: sum.added + file.added, deleted: sum.deleted + file.deleted}),
        {added: 0, deleted: 0},
    );
    return (
        <div className={b({view}, className)} data-qa={qa}>
            <Button
                ref={setAnchor}
                className={b(view === 'pill' ? 'pill' : 'summary')}
                view={view === 'pill' ? 'outlined' : 'flat-secondary'}
                size="m"
                disabled={isDisabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? popupId : undefined}
                onClick={() => changeOpen(!open)}
            >
                <span className={b('label')}>
                    {label ?? `${files.length} ${files.length === 1 ? 'file' : 'files'} changed`}
                </span>
                <DiffStat {...totals} />
            </Button>
            {view === 'card' && (onUndo || onViewChanges) && (
                <div className={b('actions')}>
                    {onUndo && (
                        <Button
                            className={b('action')}
                            size="m"
                            disabled={isDisabled}
                            onClick={onUndo}
                        >
                            <Icon data={ArrowRotateLeft} size={16} aria-hidden />
                            {undoLabel}
                        </Button>
                    )}
                    {onViewChanges && (
                        <Button
                            className={b('action')}
                            size="m"
                            disabled={isDisabled}
                            onClick={onViewChanges}
                        >
                            <Icon data={Eye} size={16} aria-hidden />
                            {viewChangesLabel}
                        </Button>
                    )}
                </div>
            )}
            <Popup
                id={popupId}
                open={open && Boolean(anchor)}
                onOpenChange={changeOpen}
                anchorElement={anchor}
                placement="top"
                offset={8}
                modal
                floatingRef={(node) => node?.setAttribute('aria-label', title)}
                role="dialog"
                className={b('popup')}
            >
                <div className={b('content')} tabIndex={0} aria-label={title}>
                    <ul>
                        {files.map((file) => (
                            <li
                                key={file.id}
                                className={b('file', {interactive: Boolean(onFileClick)})}
                            >
                                {onFileClick ? (
                                    <Button
                                        className={b('file-action')}
                                        view="flat"
                                        size="m"
                                        onClick={() => {
                                            onFileClick(file);
                                            changeOpen(false);
                                        }}
                                    >
                                        <span className={b('path')} title={file.path}>
                                            {file.path}
                                        </span>
                                        <DiffStat added={file.added} deleted={file.deleted} />
                                    </Button>
                                ) : (
                                    <span className={b('path')} title={file.path}>
                                        {file.path}
                                    </span>
                                )}
                                {!onFileClick && (
                                    <DiffStat added={file.added} deleted={file.deleted} />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </Popup>
        </div>
    );
}
