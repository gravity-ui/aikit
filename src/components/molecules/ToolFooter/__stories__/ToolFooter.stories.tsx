import {Meta, StoryFn, StoryObj} from '@storybook/react';

import {ToolFooterAction, ToolFooterProps} from 'src/types';

import {ToolFooter} from '..';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/ToolFooter',
    component: ToolFooter,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        content: {
            control: 'text',
            description: 'Status message to display',
        },
        showLoader: {
            control: 'boolean',
            description: 'Whether to show loading indicator',
        },
    },
} as Meta;

type Story = StoryObj<typeof ToolFooter>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

const rejectAction: ToolFooterAction = {
    label: 'Reject',
    onClick: () => alert('Rejected'),
    view: 'outlined',
};
const acceptAction: ToolFooterAction = {
    label: 'Accept',
    onClick: () => alert('Accepted'),
    view: 'action',
};
const cancelAction: ToolFooterAction = {
    label: 'Cancel',
    onClick: () => alert('Cancelled'),
    view: 'outlined',
};

const defaultActions: ToolFooterAction[] = [rejectAction, acceptAction];

const ToolWrapper = ({children}: {children: React.ReactNode}) => (
    <div style={{width: '430px'}}>{children}</div>
);

export const Playground: StoryFn<ToolFooterProps> = (args) => (
    <ToolWrapper>
        <ToolFooter {...args} />
    </ToolWrapper>
);
Playground.args = {
    content: 'Awaiting confirmation',
    actions: defaultActions,
    showLoader: true,
};

export const ConfirmationState: StoryObj<ToolFooterProps> = {
    render: (args) => (
        <ShowcaseItem title="Confirmation State">
            <ToolWrapper>
                <ToolFooter {...args} content="Awaiting confirmation" actions={defaultActions} />
            </ToolWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WaitingState: StoryObj<ToolFooterProps> = {
    render: (args) => (
        <ShowcaseItem title="Waiting State">
            <ToolWrapper>
                <ToolFooter {...args} content="Awaiting form submission" actions={[cancelAction]} />
            </ToolWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};
