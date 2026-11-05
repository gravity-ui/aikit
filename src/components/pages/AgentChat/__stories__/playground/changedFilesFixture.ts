import type {ChatStatus, TChatMessage} from '../../../../../types';

/** Final diff against the scenario baseline, not a sum of tool-call deltas. */
export const developerChanges = {
    added: 98,
    deleted: 7,
    files: [
        {id: 'filter-controls', path: 'src/components/ProductFilters.tsx', added: 28, deleted: 0},
        {id: 'catalog', path: 'src/components/ProductList.tsx', added: 14, deleted: 3},
        {id: 'product-hook', path: 'src/hooks/useProducts.ts', added: 22, deleted: 4},
        {id: 'filter-tests', path: 'tests/catalogFilters.test.ts', added: 34, deleted: 0},
    ],
};

/** Return only baseline changes backed by completed edit outputs in this response. */
export function getMessageChanges(message: TChatMessage) {
    if (
        message.role !== 'assistant' ||
        !Array.isArray(message.content) ||
        message.metadata?.changesUndone
    )
        return undefined;
    const parts = message.content;
    const files = developerChanges.files.filter((_, fileIndex) =>
        parts.some(
            (part) =>
                part.id === `${message.id}-tool-${fileIndex + 5}` &&
                part.type === 'tool' &&
                part.data.status === 'success',
        ),
    );
    if (!files.length) return undefined;
    return {
        runId: message.id,
        files,
        ...files.reduce(
            (sum, file) => ({added: sum.added + file.added, deleted: sum.deleted + file.deleted}),
            {added: 0, deleted: 0},
        ),
    };
}

export function getResponseState(message: TChatMessage) {
    return message.metadata?.responseState;
}

export function getDeveloperChanges(messages: TChatMessage[], status: ChatStatus) {
    if (status === 'submitted') return undefined;
    const latest = messages[messages.length - 1];
    if (!latest || getResponseState(latest) !== 'running') return undefined;
    return getMessageChanges(latest);
}
