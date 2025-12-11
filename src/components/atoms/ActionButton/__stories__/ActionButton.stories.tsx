import {Copy, Pencil} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ActionButton} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/ActionButton',
    component: ActionButton,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof ActionButton>;

const defaultDecorators = [
    (Story: StoryFn) => (
        <ContentWrapper>
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

const mockOnClick = () => {
    // eslint-disable-next-line no-console
    console.log('Button clicked');
};

export const Playground: Story = {
    args: {
        tooltipTitle: 'Copy',
        view: 'flat',
        size: 'm',
        children: <Icon data={Copy} size={16} />,
        onClick: mockOnClick,
    },
    decorators: defaultDecorators,
};

export const Default: Story = {
    args: {
        tooltipTitle: 'Edit',
        children: <Icon data={Pencil} size={16} />,
        onClick: mockOnClick,
    },
    decorators: defaultDecorators,
};

export const WithoutTooltip: Story = {
    args: {
        children: <Icon data={Copy} size={16} />,
        view: 'outlined',
        onClick: mockOnClick,
    },
    decorators: defaultDecorators,
};
