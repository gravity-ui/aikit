import React, {useState} from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {SwapArea} from '../../../../demo/SwapArea';
import type {ChatStatus} from '../../../../types/chat';
import type {TSubmitData} from '../../../../types/messages';
import {ActionButton} from '../../../atoms/ActionButton';
import {PromptInput} from '../PromptInput';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/PromptInput',
    component: PromptInput,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof PromptInput>;

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

export const WithSuggestionsAndTitle: Story = {
    args: {
        view: 'simple',
        onSend: handleSend,
        bodyProps: {
            placeholder: 'Plan, code, build and test anything',
        },
        suggestionsProps: {
            showSuggestions: true,
            suggestTitle: 'Try these prompts:',
            suggestions: [
                {title: 'Write a Python function', view: 'action'},
                {title: 'Explain this code'},
                {title: 'Debug my code'},
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

export const WithTopPanel: Story = {
    args: {
        view: 'simple',
        onSend: handleSend,
        bodyProps: {
            placeholder: 'Plan, code, build and test anything',
        },
        topPanel: {
            isOpen: true,
            children: <SwapArea />,
        },
    },
    decorators: defaultDecorators,
};

export const WithBottomPanel: Story = {
    args: {
        view: 'simple',
        onSend: handleSend,
        bodyProps: {
            placeholder: 'Plan, code, build and test anything',
        },
        bottomPanel: {
            isOpen: true,
            children: <SwapArea />,
        },
    },
    decorators: defaultDecorators,
};

export const WithBothPanels: Story = {
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
        topPanel: {
            isOpen: true,
            children: <SwapArea />,
        },
        bottomPanel: {
            isOpen: true,
            children: <SwapArea />,
        },
    },
    decorators: defaultDecorators,
};

const PanelExample = ({onClose}: {onClose: () => void}) => {
    return (
        <>
            <SwapArea />

            <ActionButton view="flat" size="m" onClick={onClose}>
                <Icon data={Xmark} size={16} />
            </ActionButton>
        </>
    );
};

export const WithPanelToggle: Story = {
    render: () => {
        const [isTopPanelOpen, setIsTopPanelOpen] = useState(false);
        const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);

        return (
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={{display: 'flex', gap: '8px'}}>
                    <ActionButton
                        view="action"
                        size="m"
                        onClick={() => setIsTopPanelOpen((prev) => !prev)}
                    >
                        Toggle Top Panel
                    </ActionButton>
                    <ActionButton
                        view="action"
                        size="m"
                        onClick={() => setIsBottomPanelOpen((prev) => !prev)}
                    >
                        Toggle Bottom Panel
                    </ActionButton>
                </div>
                <PromptInput
                    view="full"
                    onSend={handleSend}
                    bodyProps={{
                        placeholder: 'Plan, code, build and test anything',
                    }}
                    topPanel={{
                        isOpen: isTopPanelOpen,
                        children: <PanelExample onClose={() => setIsTopPanelOpen(false)} />,
                    }}
                    bottomPanel={{
                        isOpen: isBottomPanelOpen,
                        children: <PanelExample onClose={() => setIsBottomPanelOpen(false)} />,
                    }}
                />
            </div>
        );
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
        const [status, setStatus] = useState<ChatStatus>('ready');

        const handleSendWithStreaming = async (data: TSubmitData) => {
            // eslint-disable-next-line no-console
            console.log('Sending:', data);
            setStatus('streaming');
            await new Promise((resolve) => setTimeout(resolve, 3000));
            setStatus('ready');
        };

        const handleCancel = async () => {
            // eslint-disable-next-line no-console
            console.log('Cancelling');
            setStatus('ready');
        };

        return (
            <PromptInput
                {...args}
                view="full"
                onSend={handleSendWithStreaming}
                onCancel={handleCancel}
                status={status}
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
        const [status, setStatus] = useState<ChatStatus>('ready');

        const handleSendComplex = async (data: TSubmitData) => {
            // eslint-disable-next-line no-console
            console.log('Sending:', data);
            setStatus('streaming');
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setStatus('ready');
        };

        const handleCancel = async () => {
            // eslint-disable-next-line no-console
            console.log('Cancelling');
            setStatus('ready');
        };

        return (
            <PromptInput
                {...args}
                view="full"
                onSend={handleSendComplex}
                onCancel={handleCancel}
                status={status}
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
                    showSuggestions: status !== 'streaming',
                    suggestions: [{title: 'Yes', view: 'action'}, {title: 'No'}],
                }}
            />
        );
    },
    decorators: defaultDecorators,
};
