import React from 'react';

import {Meta, StoryFn} from '@storybook/react-webpack5';

import {ToolIndicator, ToolIndicatorProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/ToolIndicator',
    component: ToolIndicator,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        status: {
            control: 'radio',
            options: ['success', 'error', 'info', 'loading'],
            description: 'Current status of the tool execution',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class',
        },
        qa: {
            control: 'text',
            description: 'QA/test identifier',
        },
    },
} as Meta;

export const Playground: StoryFn<ToolIndicatorProps> = (args) => (
    <ContentWrapper>
        <ToolIndicator {...args} />
    </ContentWrapper>
);
Playground.args = {status: 'success'};

export const Success: StoryFn<ToolIndicatorProps> = (args) => (
    <ContentWrapper>
        <ToolIndicator {...args} status="success" />
    </ContentWrapper>
);
export const Error: StoryFn<ToolIndicatorProps> = (args) => (
    <ContentWrapper>
        <ToolIndicator {...args} status="error" />
    </ContentWrapper>
);
export const Info: StoryFn<ToolIndicatorProps> = (args) => (
    <ContentWrapper>
        <ToolIndicator {...args} status="info" />
    </ContentWrapper>
);
export const Loading = () => (
    <ContentWrapper>
        <ToolIndicator status="loading" />
    </ContentWrapper>
);
