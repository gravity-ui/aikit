import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {PromptInputHeader} from '../../PromptInputHeader';
import {InputContextProvider, useInputContext} from '../index';

import MDXDocs from './Docs.mdx';
import {mockInputContextFileUpload} from './mockFileUpload';

function InputContextDemo() {
    const {contextItems, attachmentContent} = useInputContext();

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80}}>
            <PromptInputHeader contextItems={contextItems} />
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>{attachmentContent}</div>
        </div>
    );
}

export default {
    title: 'molecules/InputContext',
    component: InputContextProvider,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta<typeof InputContextProvider>;

type Story = StoryObj<typeof InputContextProvider>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="450px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

const renderWithDemo: Story['render'] = (args) => (
    <InputContextProvider {...args}>
        <InputContextDemo />
    </InputContextProvider>
);

export const Playground: Story = {
    args: {
        fileUpload: mockInputContextFileUpload,
        fileDialogTitle: 'Attach files',
    },
    render: renderWithDemo,
    decorators: defaultDecorators,
};

export const Default: Story = {
    args: {
        fileUpload: mockInputContextFileUpload,
    },
    render: renderWithDemo,
    decorators: defaultDecorators,
};

export const CustomDialogTitle: Story = {
    args: {
        fileUpload: mockInputContextFileUpload,
        fileDialogTitle: 'Select documents',
    },
    render: renderWithDemo,
    decorators: defaultDecorators,
};
