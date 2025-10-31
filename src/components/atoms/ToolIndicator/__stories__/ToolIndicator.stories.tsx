import {Meta, StoryFn} from '@storybook/react';

import {ToolIndicator, ToolIndicatorProps} from '..';

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
            options: ['success', 'error', 'info'],
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

export const Playground: StoryFn<ToolIndicatorProps> = (args) => <ToolIndicator {...args} />;
Playground.args = {status: 'success'};

export const Success = () => <ToolIndicator status="success" />;
export const Error = () => <ToolIndicator status="error" />;
export const Info = () => <ToolIndicator status="info" />;
