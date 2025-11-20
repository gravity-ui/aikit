import React from 'react';

import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {Loader, LoaderProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/Loader',
    component: Loader,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        view: {
            control: 'radio',
            options: ['streaming', 'loading'],
            description: 'View',
        },
        size: {
            control: 'radio',
            options: ['xs', 's', 'm'],
            description: 'Size of element',
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

type Story = StoryObj<typeof Loader>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper>
            <Showcase>
                <Story />
            </Showcase>
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: StoryFn<LoaderProps> = (args) => (
    <ContentWrapper>
        <Loader {...args} />
    </ContentWrapper>
);
Playground.args = {view: 'streaming', size: 's'};

export const Loading: StoryFn<LoaderProps> = (args) => (
    <ContentWrapper>
        <Loader {...args} view="loading" />
    </ContentWrapper>
);

export const Streaming: StoryFn<LoaderProps> = (args) => (
    <ContentWrapper>
        <Loader {...args} view="streaming" />
    </ContentWrapper>
);

export const Size: StoryObj<LoaderProps> = {
    render: (args) => (
        <>
            <ShowcaseItem title="Size xs">
                <Loader {...args} size="xs" />
            </ShowcaseItem>
            <ShowcaseItem title="Size s">
                <Loader {...args} size="s" />
            </ShowcaseItem>
            <ShowcaseItem title="Size m">
                <Loader {...args} size="m" />
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
    args: {view: 'streaming'},
};
