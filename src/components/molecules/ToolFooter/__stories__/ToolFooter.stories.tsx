import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ToolFooterAction, ToolFooterProps} from 'src/types';

import {ToolFooter} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
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

export const Playground: StoryFn<ToolFooterProps> = (args) => (
    <ContentWrapper width="430px">
        <ToolFooter {...args} />
    </ContentWrapper>
);
Playground.args = {
    content: 'Awaiting confirmation',
    actions: defaultActions,
    showLoader: true,
};

export const ConfirmationState: StoryObj<ToolFooterProps> = {
    render: (args) => (
        <ShowcaseItem title="Confirmation State">
            <ContentWrapper width="430px">
                <ToolFooter {...args} content="Awaiting confirmation" actions={defaultActions} />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WaitingState: StoryObj<ToolFooterProps> = {
    render: (args) => (
        <ShowcaseItem title="Waiting State">
            <ContentWrapper width="430px">
                <ToolFooter {...args} content="Awaiting form submission" actions={[cancelAction]} />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};
