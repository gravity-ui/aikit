import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {type ChangedFile, ChangedFilesSummary} from '..';

import MDXDocs from './Docs.mdx';

const files: ChangedFile[] = [
    {id: 'app', path: 'src/App.tsx', added: 14, deleted: 3},
    {id: 'test', path: 'tests/App.test.tsx', added: 22, deleted: 0},
];

export default {
    title: 'molecules/ChangedFilesSummary',
    component: ChangedFilesSummary,
    parameters: {docs: {page: MDXDocs}},
    decorators: [
        (Story) => (
            <div
                style={{
                    height: 400,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                }}
            >
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ChangedFilesSummary>;
type Story = StoryObj<typeof ChangedFilesSummary>;
export const Playground: Story = {args: {files}};
export const LongList: Story = {
    args: {
        files: Array.from({length: 60}, (_, index) => ({
            id: `file-${index}`,
            path: `src/features/catalog/filters/very-long-feature-directory-${index}/ProductFiltersImplementation.tsx`,
            added: index + 1,
            deleted: index % 3,
        })),
        defaultOpen: true,
    },
};
export const DuplicateBasenames: Story = {
    args: {
        files: [
            {id: 'client', path: 'src/client/filters/index.ts', added: 8, deleted: 2},
            {id: 'server', path: 'src/server/filters/index.ts', added: 12, deleted: 1},
        ],
        defaultOpen: true,
    },
};
export const Empty: Story = {args: {files: []}};
export const Disabled: Story = {args: {files, disabled: true}};
export const WithFileAction: Story = {
    render: (args) => {
        const [selected, setSelected] = useState('');
        return (
            <div>
                <p aria-live="polite">{selected ? `Selected: ${selected}` : 'Choose a file'}</p>
                <ChangedFilesSummary {...args} onFileClick={(file) => setSelected(file.path)} />
            </div>
        );
    },
    args: {files, defaultOpen: true},
};

export const SingleFile: Story = {
    args: {
        files: [{id: 'filters', path: 'src/catalog/search.ts', added: 24, deleted: 6}],
        defaultOpen: true,
    },
};
export const DeletedOnly: Story = {
    args: {
        files: [
            {
                id: 'legacy-filter',
                path: 'src/features/catalog/legacyFilters.ts',
                added: 0,
                deleted: 32,
            },
            {id: 'legacy-test', path: 'tests/legacyFilters.test.ts', added: 0, deleted: 20},
        ],
        defaultOpen: true,
    },
};

export const CardSingleFile: Story = {args: {...SingleFile.args, view: 'card', defaultOpen: false}};
export const CardMultipleFiles: Story = {args: {files, view: 'card'}};
export const CardDisabled: Story = {
    args: {files, view: 'card', disabled: true, onUndo: () => {}, onViewChanges: () => {}},
};
export const CardActions: Story = {
    render: (args) => {
        const [undone, setUndone] = useState(false);
        const [preview, setPreview] = useState(false);
        if (undone)
            return (
                <div role="status">
                    Fixture changes reverted.{' '}
                    <button onClick={() => setUndone(false)}>Restore fixture</button>
                </div>
            );
        return (
            <div style={{width: 420}}>
                <ChangedFilesSummary
                    {...args}
                    onUndo={() => setUndone(true)}
                    onViewChanges={() => setPreview((value) => !value)}
                />
                {preview && (
                    <pre aria-label="Fixture preview">
                        {'+ Example fixture change\n- Previous fixture value'}
                    </pre>
                )}
            </div>
        );
    },
    args: {files, view: 'card'},
};
