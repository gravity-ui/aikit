import type {TMessageContentUnion} from '../../../types';

import type {
    StreamEventContentUpdate,
    StreamEventTextDelta,
    StreamEventThinkingDelta,
    StreamEventThinkingDone,
    StreamEventToolAdd,
    StreamEventToolUpdate,
} from './getStreamEventContentUpdate';

function findContentPartIndex(
    parts: TMessageContentUnion[],
    partType: 'tool' | 'thinking',
    id: string,
): number {
    return parts.findIndex((p) => p.type === partType && (p as {id?: string}).id === id);
}

export function applyContentUpdate(
    parts: TMessageContentUnion[],
    update: StreamEventContentUpdate,
): TMessageContentUnion[] | null {
    switch (update.kind) {
        case 'text_delta':
            return applyTextDelta(parts, update);
        case 'tool_add':
            return applyToolAdd(parts, update);
        case 'tool_update':
            return applyToolUpdate(parts, update);
        case 'thinking_add':
            return applyThinkingAdd(parts, update);
        case 'thinking_delta':
            return applyThinkingDelta(parts, update);
        case 'thinking_done':
            return applyThinkingDone(parts, update);
        default:
            return null;
    }
}

function applyTextDelta(
    parts: TMessageContentUnion[],
    update: StreamEventTextDelta,
): TMessageContentUnion[] {
    const last = parts[parts.length - 1];
    if (last?.type === 'text') {
        return [
            ...parts.slice(0, -1),
            {type: 'text' as const, data: {text: last.data.text + update.delta}},
        ];
    }
    return [...parts, {type: 'text' as const, data: {text: update.delta}}];
}

function applyToolAdd(
    parts: TMessageContentUnion[],
    update: StreamEventToolAdd,
): TMessageContentUnion[] {
    const status = update.status ?? 'loading';
    const data: {toolName: string; status: typeof status; headerContent?: string} = {
        toolName: update.toolName,
        status,
    };
    if (update.headerContent !== undefined) {
        data.headerContent = update.headerContent;
    }
    return [
        ...parts,
        {
            type: 'tool' as const,
            id: update.id,
            data,
        },
    ];
}

function applyToolUpdate(
    parts: TMessageContentUnion[],
    update: StreamEventToolUpdate,
): TMessageContentUnion[] {
    let idx = findContentPartIndex(parts, 'tool', update.item_id);
    let partsToUpdate = parts;
    if (idx < 0) {
        partsToUpdate = applyToolAdd(parts, {
            kind: 'tool_add',
            id: update.item_id,
            toolName: update.toolName ?? '',
            status: update.status,
            headerContent: update.output ?? update.error,
        });
        idx = partsToUpdate.length - 1;
    }
    const prev = partsToUpdate[idx];
    if (prev.type !== 'tool') return partsToUpdate;
    return partsToUpdate.map((p, i) =>
        i === idx
            ? {
                  ...prev,
                  data: {
                      ...prev.data,
                      ...(update.toolName && {toolName: update.toolName}),
                      status: update.status,
                      headerContent: update.output ?? update.error ?? prev.data.headerContent,
                  },
              }
            : p,
    );
}

function applyThinkingAdd(
    parts: TMessageContentUnion[],
    update: {kind: 'thinking_add'; item_id: string},
): TMessageContentUnion[] {
    return [
        ...parts,
        {
            type: 'thinking' as const,
            id: update.item_id,
            data: {
                content: '',
                status: 'thinking' as const,
                defaultExpanded: false,
            },
        },
    ];
}

function applyThinkingDelta(
    parts: TMessageContentUnion[],
    update: StreamEventThinkingDelta,
): TMessageContentUnion[] | null {
    const idx = findContentPartIndex(parts, 'thinking', update.item_id);
    if (idx < 0 || parts[idx].type !== 'thinking') {
        return null;
    }
    const prev = parts[idx];
    const prevContent = prev.data.content;
    let prevText = '';
    if (typeof prevContent === 'string') {
        prevText = prevContent;
    } else if (Array.isArray(prevContent)) {
        prevText = prevContent.join('');
    }
    const newContent = prevText + update.delta;
    return parts.map((p, i) =>
        i === idx ? {...prev, data: {...prev.data, content: newContent}} : p,
    );
}

function applyThinkingDone(
    parts: TMessageContentUnion[],
    update: StreamEventThinkingDone,
): TMessageContentUnion[] | null {
    const idx = findContentPartIndex(parts, 'thinking', update.item_id);
    if (idx < 0 || parts[idx].type !== 'thinking') {
        return null;
    }
    const prev = parts[idx];
    return parts.map((p, i) =>
        i === idx
            ? {
                  ...prev,
                  data: {
                      ...prev.data,
                      content: update.text,
                      status: 'thought' as const,
                  },
              }
            : p,
    );
}
