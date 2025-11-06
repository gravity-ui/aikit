import {Meta, StoryFn, StoryObj} from '@storybook/react';

import {Alert, AlertProps} from '..';
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
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

export const Playground: StoryFn<AlertProps> = (args) => <Alert {...args} />;
Playground.args = {
    text: 'Alert message',
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
    <Alert {...args} button={{content: 'Retry', onClick: () => ({})}} />
);
Action.args = {
    text: 'Alert message',
    variant: 'default',
};
