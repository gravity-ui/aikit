import React from 'react';

import {Meta, StoryFn} from '@storybook/react-webpack5';

import {ContextItem} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

type ContextItemProps = React.ComponentProps<typeof ContextItem>;

export default {
    title: 'atoms/ContextItem',
    component: ContextItem,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        content: {
            control: 'text',
            description: 'Content of label',
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

export const Playground: StoryFn<ContextItemProps> = (args) => (
    <ContentWrapper>
        <ContextItem {...args} />
    </ContentWrapper>
);
Playground.args = {
    content: 'My context',
    onClick: () => {},
};
