import {ChevronDown, Copy, Pencil} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ToolHeader} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import type {Action} from '../../../../types/common';
import type {ToolHeaderProps} from '../../../../types/tool';

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

const copyAction: Action = {
    label: 'Copy',
    onClick: () => alert('Copied'),
    icon: <Icon data={Copy} size={16} />,
};

const collapseAction: Action = {
    label: 'Collapse',
    onClick: () => alert('Collapsed'),
    icon: <Icon data={ChevronDown} size={16} />,
};

export const Playground: StoryFn<ToolHeaderProps> = (args) => (
    <ContentWrapper width="430px">
        <ToolHeader {...args} />
    </ContentWrapper>
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
        <ContentWrapper width="430px">
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
        </ContentWrapper>
    ),
    decorators: defaultDecorators,
};

export const Success: StoryObj<ToolHeaderProps> = {
    render: (args) => (
        <ContentWrapper width="430px">
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
        </ContentWrapper>
    ),
    decorators: defaultDecorators,
};
