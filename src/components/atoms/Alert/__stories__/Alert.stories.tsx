import {Arrows3RotateLeft} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {Alert, AlertProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/Alert',
    component: Alert,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },

    argTypes: {
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

type Story = StoryObj<typeof Alert>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper>
            <Showcase>
                <Story />
            </Showcase>
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: StoryFn<AlertProps> = (args) => (
    <ContentWrapper>
        <Alert {...args} />
    </ContentWrapper>
);
Playground.args = {
    text: 'Alert message',
    variant: 'default',
};

export const Variant: StoryObj<AlertProps> = {
    render: (args) => (
        <>
            <ShowcaseItem title="Default">
                <Alert {...args} variant="default" />
            </ShowcaseItem>
            <ShowcaseItem title="Info">
                <Alert {...args} variant="info" />
            </ShowcaseItem>
            <ShowcaseItem title="Warning">
                <Alert {...args} variant="warning" />
            </ShowcaseItem>
            <ShowcaseItem title="Error">
                <Alert {...args} variant="error" />
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
    args: {text: 'Alert message'},
};

export const Action: StoryFn<AlertProps> = (args) => (
    <ContentWrapper>
        <Alert {...args} button={{content: 'Retry', onClick: () => ({})}} />
    </ContentWrapper>
);
Action.args = {
    text: 'Alert message',
    variant: 'default',
};

export const LongText: StoryFn<AlertProps> = (args) => (
    <ContentWrapper>
        <Alert {...args} button={{content: 'Retry', onClick: () => ({})}} />
    </ContentWrapper>
);
LongText.args = {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    variant: 'warning',
};

export const CustomIcon: StoryFn<AlertProps> = (args) => (
    <ContentWrapper>
        <Alert {...args} icon={<Icon data={Arrows3RotateLeft} size={20} />} />
    </ContentWrapper>
);
CustomIcon.args = {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    variant: 'default',
    button: {content: 'Retry', onClick: () => ({})},
};
