import React, {useState} from 'react';

import {Button} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

// Small gradient SVG used as mock image previews in stories
const MOCK_PREVIEW_BLUE =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0MmE1ZjUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNhYjQ3YmMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDUiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+PHBvbHlnb24gcG9pbnRzPSI1NSw2MCA4MCw4MCAzMCw4MCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNiIvPjwvc3ZnPg==';
const MOCK_PREVIEW_GREEN =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NmJiNmEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZmI3MDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjI1IiB5PSIyNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iOCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNyIvPjwvc3ZnPg==';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {FileUploadDialog} from '../FileUploadDialog';

import MDXDocs from './Docs.mdx';

const meta: Meta<typeof FileUploadDialog> = {
    title: 'organisms/FileUploadDialog',
    component: FileUploadDialog,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
};

export default meta;
type Story = StoryObj<typeof FileUploadDialog>;

const Controlled = (props: Partial<React.ComponentProps<typeof FileUploadDialog>>) => {
    const [open, setOpen] = useState(false);
    return (
        <ContentWrapper>
            <Button onClick={() => setOpen(true)}>Open dialog</Button>
            <FileUploadDialog
                open={open}
                onClose={() => setOpen(false)}
                onAdd={(files) => {
                    // eslint-disable-next-line no-console
                    console.log('Added:', files);
                }}
                files={[]}
                {...props}
            />
        </ContentWrapper>
    );
};

export const Playground: Story = {render: () => <Controlled />};

export const Default: Story = {render: () => <Controlled />};

export const WithFiles: Story = {
    render: () => (
        <Controlled
            files={[
                {
                    name: 'document.pdf',
                    size: 102400,
                    status: 'success',
                    mimeType: 'application/pdf',
                },
                {name: 'image.png', size: 204800, status: 'loading', mimeType: 'image/png'},
                {name: 'broken.zip', size: 512, status: 'error', mimeType: 'application/zip'},
            ]}
        />
    ),
};

export const WithImagePreviews: Story = {
    render: () => (
        <Controlled
            accept="image/*"
            dropZoneHint="Supported: JPG, PNG, GIF, WEBP"
            files={[
                {
                    name: 'photo.jpg',
                    size: 524288,
                    status: 'success',
                    mimeType: 'image/jpeg',
                    previewUrl: MOCK_PREVIEW_BLUE,
                    onRemove: () => {},
                },
                {
                    name: 'screenshot.png',
                    size: 204800,
                    status: 'loading',
                    mimeType: 'image/png',
                    previewUrl: MOCK_PREVIEW_GREEN,
                    onRemove: () => {},
                },
                {
                    name: 'avatar.webp',
                    size: 81920,
                    status: 'success',
                    mimeType: 'image/webp',
                    previewUrl: MOCK_PREVIEW_BLUE,
                    onRemove: () => {},
                },
            ]}
        />
    ),
};

export const WithApply: Story = {
    render: () => (
        <Controlled
            onApply={() => {
                // eslint-disable-next-line no-console
                console.log('applied');
            }}
        />
    ),
};

export const ImagesOnly: Story = {
    render: () => <Controlled accept="image/*" dropZoneHint="Supported: JPG, PNG, GIF, WEBP" />,
};
