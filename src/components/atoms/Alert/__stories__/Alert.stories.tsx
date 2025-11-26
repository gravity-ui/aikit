import React from 'react';

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

export const CollapsibleWithLongContent: StoryFn<AlertProps> = (args) => (
    <ContentWrapper width="430px">
        <Alert
            {...args}
            text="Error occurred"
            initialExpanded={true}
            variant="error"
            button={{content: 'Retry', onClick: () => ({})}}
            content={
                <div>
                    <p>Full error log:</p>
                    <pre
                        style={{
                            margin: 0,
                            fontSize: '12px',
                            maxHeight: '200px',
                            overflow: 'auto',
                        }}
                    >
                        {`[2024-01-15 10:23:45] ERROR: Connection failed
[2024-01-15 10:23:45] DEBUG: Attempting to reconnect...
[2024-01-15 10:23:46] ERROR: Reconnection failed
[2024-01-15 10:23:46] DEBUG: Retrying in 5 seconds...
[2024-01-15 10:23:51] ERROR: Connection timeout
[2024-01-15 10:23:51] DEBUG: Stack trace:
    at ConnectionManager.connect (connection.js:45)
    at NetworkHandler.handleRequest (network.js:123)
    at API.request (api.js:67)
    at UserService.fetchData (user.js:23)
    at Component.loadUser (component.js:10)`}
                    </pre>
                </div>
            }
        />
    </ContentWrapper>
);
