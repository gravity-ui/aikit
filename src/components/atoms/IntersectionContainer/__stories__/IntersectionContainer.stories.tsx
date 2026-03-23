import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {IntersectionContainer} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/IntersectionContainer',
    component: IntersectionContainer,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof IntersectionContainer>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper>
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    args: {
        children: <div>Observed content</div>,
    },
    decorators: defaultDecorators,
};

export const Default: Story = {
    args: {
        children: <div>Content without intersection observer</div>,
    },
    decorators: defaultDecorators,
};

export const WithIntersect: Story = {
    args: {
        children: <div>Content with intersection callback</div>,
        onIntersect: () => {
            // eslint-disable-next-line no-console
            console.log('Intersection callback triggered');
        },
    },
    decorators: defaultDecorators,
};
