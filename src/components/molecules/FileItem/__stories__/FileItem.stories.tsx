import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {FileItem} from '../FileItem';

import MDXDocs from './Docs.mdx';

const meta: Meta<typeof FileItem> = {
    title: 'molecules/FileItem',
    component: FileItem,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    args: {
        name: 'document.pdf',
        size: 102400,
        mimeType: 'application/pdf',
    },
};

export default meta;
type Story = StoryObj<typeof FileItem>;

const decorators = [
    (Story) => (
        <ContentWrapper>
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    decorators,
};

export const Default: Story = {
    decorators,
};

export const Loading: Story = {
    args: {status: 'loading'},
    decorators,
};

export const Success: Story = {
    args: {status: 'success'},
    decorators,
};

export const Error: Story = {
    args: {status: 'error'},
    decorators,
};

export const WithRemove: Story = {
    args: {
        onRemove: () => {},
    },
    decorators,
};

// Small gradient SVG used as a mock image preview in stories
const MOCK_IMAGE_PREVIEW =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0MmE1ZjUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNhYjQ3YmMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDUiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+PHBvbHlnb24gcG9pbnRzPSI1NSw2MCA4MCw4MCAzMCw4MCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNiIvPjwvc3ZnPg==';

export const WithImagePreview: Story = {
    args: {
        name: 'photo.jpg',
        size: 512000,
        mimeType: 'image/jpeg',
        previewUrl: MOCK_IMAGE_PREVIEW,
        status: 'success',
        onRemove: () => {},
    },
    decorators,
};

export const WithImagePreviewLoading: Story = {
    args: {
        name: 'screenshot.png',
        size: 204800,
        mimeType: 'image/png',
        previewUrl: MOCK_IMAGE_PREVIEW,
        status: 'loading',
        onRemove: () => {},
    },
    decorators,
};

export const LongName: Story = {
    args: {
        name: 'very-long-file-name-that-should-be-truncated-with-ellipsis.pdf',
        onRemove: () => {},
    },
    decorators: [
        (Story) => (
            <ContentWrapper>
                <div style={{width: 240}}>
                    <Story />
                </div>
            </ContentWrapper>
        ),
    ],
};
