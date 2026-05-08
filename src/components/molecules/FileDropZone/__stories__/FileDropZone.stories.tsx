import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {FileDropZone} from '../FileDropZone';

import MDXDocs from './Docs.mdx';

const meta: Meta<typeof FileDropZone> = {
    title: 'molecules/FileDropZone',
    component: FileDropZone,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    args: {
        onAdd: (files) => {
            // eslint-disable-next-line no-console
            console.log('Files added:', files);
        },
    },
};

export default meta;
type Story = StoryObj<typeof FileDropZone>;

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

export const WithHint: Story = {
    args: {
        hint: 'Supported: PDF, images, documents',
    },
    decorators,
};

export const ImagesOnly: Story = {
    args: {
        accept: 'image/*',
        hint: 'Supported: JPG, PNG, GIF, WEBP',
    },
    decorators,
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
    decorators,
};
