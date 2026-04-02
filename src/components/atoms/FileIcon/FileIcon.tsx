import {
    Code,
    File,
    FileCode,
    FileLetterP,
    FileText,
    FileZipper,
    Headphones,
    MusicNote,
    Video,
} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {IconData} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './FileIcon.scss';

const b = block('file-icon');

const ICON_SIZE_MAP = {s: 12, m: 16, l: 20} as const;

export type FileIconSize = 's' | 'm' | 'l';

export type FileIconProps = {
    mimeType?: string;
    fileName?: string;
    size?: FileIconSize;
    className?: string;
};

function getIconByMimeType(mimeType: string): IconData {
    const type = mimeType.split('/')[0];
    const subtype = mimeType.split('/')[1] ?? '';

    if (type === 'image') return File;
    if (type === 'audio' || subtype.includes('audio')) return Headphones;
    if (type === 'video') return Video;
    if (type === 'text') {
        if (subtype === 'plain') return FileText;
        return FileCode;
    }
    if (subtype === 'pdf') return FileLetterP;
    if (
        subtype === 'json' ||
        subtype === 'xml' ||
        subtype === 'html' ||
        subtype === 'javascript' ||
        subtype === 'typescript'
    ) {
        return FileCode;
    }
    if (subtype.includes('zip') || subtype.includes('tar') || subtype.includes('gzip')) {
        return FileZipper;
    }
    if (subtype.includes('spreadsheet') || subtype.includes('csv')) return FileText;
    if (subtype.includes('word') || subtype.includes('document')) return FileText;
    if (subtype.includes('presentation')) return File;
    return File;
}

function getIconByExtension(ext: string): IconData {
    const lower = ext.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(lower)) return File;
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(lower)) return MusicNote;
    if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'].includes(lower)) return Video;
    if (['pdf'].includes(lower)) return FileLetterP;
    if (['zip', 'tar', 'gz', 'rar', '7z', 'bz2'].includes(lower)) return FileZipper;
    if (['js', 'ts', 'tsx', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'cs'].includes(lower)) {
        return Code;
    }
    if (['json', 'xml', 'html', 'css', 'yml', 'yaml'].includes(lower)) return FileCode;
    if (['txt', 'md', 'log', 'csv', 'tsv'].includes(lower)) return FileText;
    return File;
}

function resolveIcon(mimeType?: string, fileName?: string): IconData {
    if (mimeType) return getIconByMimeType(mimeType);
    if (fileName) {
        const parts = fileName.split('.');
        if (parts.length > 1) return getIconByExtension(parts[parts.length - 1]);
    }
    return File;
}

/**
 * FileIcon displays an icon representing a file based on its MIME type or file name extension.
 */
export const FileIcon = ({mimeType, fileName, size = 'm', className}: FileIconProps) => {
    const icon = resolveIcon(mimeType, fileName);
    return <Icon data={icon} size={ICON_SIZE_MAP[size]} className={b({size}, className)} />;
};
