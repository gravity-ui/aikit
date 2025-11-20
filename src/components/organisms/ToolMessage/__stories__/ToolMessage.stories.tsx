import React from 'react';

import {Archive, Copy, Pencil} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ToolMessage} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import {SwapArea} from '../../../../demo/SwapArea';
import type {ToolMessageProps} from '../../../../types/tool';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/ToolMessage',
    component: ToolMessage,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        toolName: {
            control: 'text',
            description: 'Name of the tool',
        },
    },
} as Meta;

type Story = StoryObj<typeof ToolMessage>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

const defaultArgs: ToolMessageProps = {
    toolName: 'Writing',
    toolIcon: <Icon data={Pencil} size={16} />,
    headerContent: <Text color="secondary">expectScreenshotFixture.ts</Text>,
};

export const Playground: StoryFn<ToolMessageProps> = (args) => (
    <ContentWrapper width="430px">
        <ToolMessage {...args} />
    </ContentWrapper>
);
Playground.args = {
    ...defaultArgs,
    status: 'success',
    bodyContent: <SwapArea />,
};

export const WaitingSubmission: StoryObj<ToolMessageProps> = {
    render: () => (
        <ShowcaseItem title="Waiting Submission">
            <ContentWrapper width="430px">
                <ToolMessage
                    toolName="Creating repository"
                    status="waitingSubmission"
                    toolIcon={<Icon data={Archive} size={16} />}
                    bodyContent={
                        <Text>
                            Almost done creating your shiny new repository. Take a moment to review
                            the name, visibility, and template. When you're ready, click 'Create
                            repository' to finish!
                        </Text>
                    }
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WaitingConfirmation: StoryObj<ToolMessageProps> = {
    render: () => (
        <ShowcaseItem title="Waiting Confirmation">
            <ContentWrapper width="430px">
                <ToolMessage
                    {...defaultArgs}
                    status="waitingConfirmation"
                    bodyContent={<SwapArea />}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const CustomHeaderActions: StoryObj<ToolMessageProps> = {
    render: () => (
        <ShowcaseItem title="With Custom Header Actions">
            <ContentWrapper width="430px">
                <ToolMessage
                    {...defaultArgs}
                    headerActions={[
                        {
                            label: 'Copy',
                            onClick: () => alert('Copied'),
                            icon: <Icon data={Copy} size={16} />,
                        },
                    ]}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const CustomFooterActions: StoryObj<ToolMessageProps> = {
    render: () => (
        <ShowcaseItem title="With Custom Footer Actions">
            <ContentWrapper width="430px">
                <ToolMessage
                    {...defaultArgs}
                    status="waitingConfirmation"
                    footerActions={[
                        {
                            label: 'Custom action',
                            onClick: () => alert('Custom action'),
                            view: 'action',
                        },
                    ]}
                    bodyContent={<SwapArea />}
                    footerContent="Custom footer content"
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const Loading: StoryObj<ToolMessageProps> = {
    render: () => (
        <ShowcaseItem title="Loading">
            <ContentWrapper width="430px">
                <ToolMessage {...defaultArgs} status="loading" />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const Error: StoryObj<ToolMessageProps> = {
    render: () => (
        <ShowcaseItem title="Error">
            <ContentWrapper width="430px">
                <ToolMessage {...defaultArgs} status="error" bodyContent={<SwapArea />} />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};
