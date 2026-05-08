import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {FileIcon} from '../FileIcon';

import MDXDocs from './Docs.mdx';

const meta: Meta<typeof FileIcon> = {
    title: 'atoms/FileIcon',
    component: FileIcon,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    args: {
        size: 'm',
    },
};

export default meta;
type Story = StoryObj<typeof FileIcon>;

export const Playground: Story = {
    args: {
        mimeType: 'application/pdf',
    },
    decorators: [
        (Story) => (
            <ContentWrapper>
                <Story />
            </ContentWrapper>
        ),
    ],
};

export const Default: Story = {
    args: {
        mimeType: 'application/pdf',
    },
    decorators: [
        (Story) => (
            <ContentWrapper>
                <Story />
            </ContentWrapper>
        ),
    ],
};

export const Image: Story = {
    args: {
        mimeType: 'image/png',
    },
    decorators: [
        (Story) => (
            <ContentWrapper>
                <Story />
            </ContentWrapper>
        ),
    ],
};

export const Code: Story = {
    args: {
        fileName: 'main.py',
    },
    decorators: [
        (Story) => (
            <ContentWrapper>
                <Story />
            </ContentWrapper>
        ),
    ],
};

export const Archive: Story = {
    args: {
        fileName: 'archive.zip',
    },
    decorators: [
        (Story) => (
            <ContentWrapper>
                <Story />
            </ContentWrapper>
        ),
    ],
};

export const Sizes: Story = {
    render: () => (
        <ContentWrapper>
            <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                <FileIcon mimeType="application/pdf" size="s" />
                <FileIcon mimeType="application/pdf" size="m" />
                <FileIcon mimeType="application/pdf" size="l" />
            </div>
        </ContentWrapper>
    ),
};
