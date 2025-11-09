import {ChevronDown, Copy, Pencil} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react';

import {ToolHeader} from '..';
import {Showcase} from '../../../../demo/Showcase';
import type {ToolHeaderAction, ToolHeaderProps} from '../../../../types/tool';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/ToolHeader',
    component: ToolHeader,
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
        status: {
            control: 'select',
            options: ['success', 'error', 'loading'],
            description: 'Status indicator',
        },
    },
} as Meta;

type Story = StoryObj<typeof ToolHeader>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

const copyAction: ToolHeaderAction = {
    label: 'Copy',
    onClick: () => alert('Copied'),
    icon: <Icon data={Copy} size={16} />,
};

const collapseAction: ToolHeaderAction = {
    label: 'Collapse',
    onClick: () => alert('Collapsed'),
    icon: <Icon data={ChevronDown} size={16} />,
};

const ToolWrapper = ({children}: {children: React.ReactNode}) => (
    <div style={{width: '430px'}}>{children}</div>
);

export const Playground: StoryFn<ToolHeaderProps> = (args) => (
    <ToolWrapper>
        <ToolHeader {...args} />
    </ToolWrapper>
);
Playground.args = {
    toolIcon: <Icon data={Pencil} size={16} />,
    toolName: 'Writing',
    content: (
        <Text color="secondary" variant="body-1">
            expectScreenshotFixture.ts
        </Text>
    ),
    status: 'success',
};

export const Loading: StoryObj<ToolHeaderProps> = {
    render: (args) => (
        <ToolWrapper>
            <ToolHeader
                {...args}
                toolIcon={<Icon data={Pencil} size={16} />}
                toolName="Writing"
                content={
                    <Text color="secondary" variant="body-1">
                        expectScreenshotFixture.ts
                    </Text>
                }
                status="loading"
            />
        </ToolWrapper>
    ),
    decorators: defaultDecorators,
};

export const Success: StoryObj<ToolHeaderProps> = {
    render: (args) => (
        <ToolWrapper>
            <ToolHeader
                {...args}
                toolIcon={<Icon data={Pencil} size={16} />}
                toolName="Writing"
                content={
                    <Text color="secondary" variant="body-1">
                        expectScreenshotFixture.ts
                    </Text>
                }
                actions={[collapseAction, copyAction]}
                status="success"
            />
        </ToolWrapper>
    ),
    decorators: defaultDecorators,
};
