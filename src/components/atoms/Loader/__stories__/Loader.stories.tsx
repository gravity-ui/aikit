import {Meta, StoryFn, StoryObj} from '@storybook/react';

import {Loader, LoaderProps} from '..';
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
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

export const Playground: StoryFn<LoaderProps> = (args) => <Loader {...args} />;
Playground.args = {view: 'streaming', size: 's'};

export const Loading: StoryFn<LoaderProps> = (args) => <Loader {...args} view="loading" />;

export const Streaming: StoryFn<LoaderProps> = (args) => <Loader {...args} view="streaming" />;

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
