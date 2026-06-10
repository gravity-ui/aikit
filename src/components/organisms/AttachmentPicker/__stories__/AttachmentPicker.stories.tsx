import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {AttachmentPicker} from '../AttachmentPicker';

import MDXDocs from './Docs.mdx';

const meta: Meta<typeof AttachmentPicker> = {
    title: 'organisms/AttachmentPicker',
    component: AttachmentPicker,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    args: {
        fileDialogProps: {
            onAdd: (files) => {
                // eslint-disable-next-line no-console
                console.log('Files added:', files);
            },
            files: [],
        },
    },
};

export default meta;
type Story = StoryObj<typeof AttachmentPicker>;

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

export const UploadOnly: Story = {
    args: {
        uploadOnly: true,
    },
    decorators,
};

export const WithStorage: Story = {
    args: {
        uploadOnly: false,
        onSelectFromStorage: () => {
            // eslint-disable-next-line no-console
            console.log('Select from storage');
        },
    },
    decorators,
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
    decorators,
};
