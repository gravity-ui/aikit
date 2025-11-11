import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {PromptBox} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {SwapArea} from '../../../../demo/SwapArea/SwapArea';
import type {TSubmitData} from '../../../../types/messages';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/PromptBox',
    component: PromptBox,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof PromptBox>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="450px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

const handleSend = async (data: TSubmitData) => {
    // eslint-disable-next-line no-console
    console.log('Sending:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const Playground: Story = {
    args: {
        view: 'simple',
        onSend: handleSend,
        bodyProps: {
            placeholder: 'Plan, code, build and test anything',
        },
        footerProps: {
            showAttachment: true,
            showMicrophone: true,
        },
    },
    decorators: defaultDecorators,
};

export const FullView: Story = {
    args: {
        view: 'full',
        onSend: handleSend,
        bodyProps: {
            placeholder: 'Plan, code, build and test anything',
        },
        headerProps: {
            showContextIndicator: true,
            contextIndicatorProps: {
                type: 'percent',
                usedContext: 24,
            },
        },
        footerProps: {
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
    },
    decorators: defaultDecorators,
};

export const WithSuggestions: Story = {
    args: {
        view: 'simple',
        onSend: handleSend,
        bodyProps: {
            placeholder: 'Plan, code, build and test anything',
        },
        suggestionsProps: {
            showSuggestions: true,
            suggestions: [
                {title: 'Write a Python function', view: 'action'},
                {title: 'Explain this code'},
            ],
            // eslint-disable-next-line no-console
            onSuggestionClick: (suggestion) => console.log('Suggestion clicked:', suggestion),
        },
    },
    decorators: defaultDecorators,
};

export const WithContextIndicator: Story = {
    args: {
        view: 'full',
        onSend: handleSend,
        bodyProps: {
            placeholder: 'Plan, code, build and test anything',
        },
        headerProps: {
            showContextIndicator: true,
            contextIndicatorProps: {
                type: 'percent',
                usedContext: 24,
            },
        },
    },
    decorators: defaultDecorators,
};

export const WithCustomTopContent: Story = {
    args: {
        view: 'full',
        onSend: handleSend,
        bodyProps: {
            placeholder: 'Plan, code, build and test anything',
        },
        headerProps: {
            topContent: <SwapArea />,
        },
    },
    decorators: defaultDecorators,
};

export const WithCustomBottomContent: Story = {
    args: {
        view: 'full',
        onSend: handleSend,
        bodyProps: {
            placeholder: 'Plan, code, build and test anything',
        },
        footerProps: {
            bottomContent: <SwapArea />,
        },
    },
    decorators: defaultDecorators,
};

export const Disabled: Story = {
    args: {
        view: 'simple',
        onSend: handleSend,
        disabled: true,
        bodyProps: {
            placeholder: 'Plan, code, build and test anything',
        },
    },
    decorators: defaultDecorators,
};

export const Streaming: Story = {
    render: (args) => {
        const [isStreaming, setIsStreaming] = useState(false);

        const handleSendWithStreaming = async (data: TSubmitData) => {
            // eslint-disable-next-line no-console
            console.log('Sending:', data);
            setIsStreaming(true);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            setIsStreaming(false);
        };

        const handleCancel = async () => {
            // eslint-disable-next-line no-console
            console.log('Cancelling');
            setIsStreaming(false);
        };

        return (
            <PromptBox
                {...args}
                view="full"
                onSend={handleSendWithStreaming}
                onCancel={handleCancel}
                isStreaming={isStreaming}
                bodyProps={{
                    placeholder: 'Plan, code, build and test anything',
                }}
                footerProps={{
                    showSettings: true,
                    showAttachment: true,
                    showMicrophone: true,
                }}
            />
        );
    },
    decorators: defaultDecorators,
};

export const ComplexExample: Story = {
    render: (args) => {
        const [isStreaming, setIsStreaming] = useState(false);

        const handleSendComplex = async (data: TSubmitData) => {
            // eslint-disable-next-line no-console
            console.log('Sending:', data);
            setIsStreaming(true);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setIsStreaming(false);
        };

        const handleCancel = async () => {
            // eslint-disable-next-line no-console
            console.log('Cancelling');
            setIsStreaming(false);
        };

        return (
            <PromptBox
                {...args}
                view="full"
                onSend={handleSendComplex}
                onCancel={handleCancel}
                isStreaming={isStreaming}
                bodyProps={{
                    placeholder: 'Plan, code, build and test anything',
                }}
                headerProps={{
                    showContextIndicator: true,
                    contextIndicatorProps: {
                        type: 'percent',
                        usedContext: 24,
                    },
                }}
                footerProps={{
                    showSettings: true,
                    showAttachment: true,
                    showMicrophone: true,
                    // eslint-disable-next-line no-console
                    onSettingsClick: () => console.log('Settings'),
                    // eslint-disable-next-line no-console
                    onAttachmentClick: () => console.log('Attachment'),
                    // eslint-disable-next-line no-console
                    onMicrophoneClick: () => console.log('Microphone'),
                }}
                suggestionsProps={{
                    showSuggestions: !isStreaming,
                    suggestions: [{title: 'Yes', view: 'action'}, {title: 'No'}],
                }}
            />
        );
    },
    decorators: defaultDecorators,
};
