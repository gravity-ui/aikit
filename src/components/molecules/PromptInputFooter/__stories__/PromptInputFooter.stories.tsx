import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {PromptInputFooter} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {SwapArea} from '../../../../demo/SwapArea/SwapArea';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/PromptInputFooter',
    component: PromptInputFooter,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof PromptInputFooter>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="450px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    args: {
        submitButton: {
            // eslint-disable-next-line no-console
            onClick: async () => console.log('Submit clicked'),
            state: 'enabled',
        },
    },
    decorators: defaultDecorators,
};

export const WithAllIcons: Story = {
    args: {
        submitButton: {
            // eslint-disable-next-line no-console
            onClick: async () => console.log('Submit clicked'),
            state: 'enabled',
        },
        showSettings: true,
        showAttachment: true,
        showMicrophone: true,
        // eslint-disable-next-line no-console
        onSettingsClick: () => console.log('Settings clicked'),
        // eslint-disable-next-line no-console
        onAttachmentClick: () => console.log('Attachment clicked'),
        // eslint-disable-next-line no-console
        onMicrophoneClick: () => console.log('Microphone clicked'),
    },
    decorators: defaultDecorators,
};

export const DisabledButton: Story = {
    args: {
        submitButton: {
            // eslint-disable-next-line no-console
            onClick: async () => console.log('Submit clicked'),
            state: 'disabled',
        },
        showSettings: true,
        showAttachment: true,
        showMicrophone: true,
    },
    decorators: defaultDecorators,
};

export const LoadingButton: Story = {
    args: {
        submitButton: {
            // eslint-disable-next-line no-console
            onClick: async () => console.log('Submit clicked'),
            state: 'loading',
        },
        showSettings: true,
        showAttachment: true,
        showMicrophone: true,
    },
    decorators: defaultDecorators,
};

export const CancelableButton: Story = {
    args: {
        submitButton: {
            // eslint-disable-next-line no-console
            onClick: async () => console.log('Cancel clicked'),
            state: 'cancelable',
        },
        showSettings: true,
        showAttachment: true,
        showMicrophone: true,
    },
    decorators: defaultDecorators,
};

export const WithCustomContent: Story = {
    args: {
        submitButton: {
            // eslint-disable-next-line no-console
            onClick: async () => console.log('Submit clicked'),
            state: 'enabled',
        },
        children: <SwapArea />,
    },
    decorators: defaultDecorators,
};
